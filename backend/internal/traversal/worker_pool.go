package traversal

import "sync"

func parallelFor(total int, workers int, doWork func(jobIndex int)) {
	if total <= 0 {
		return
	}

	if workers <= 0 {
		workers = 1
	}
	if workers > total {
		workers = total
	}

	jobs := make(chan int)

	var wg sync.WaitGroup

	for i := 0; i < workers; i++ {
		wg.Add(1)

		go func() {
			defer wg.Done()

			for jobIndex := range jobs {
				doWork(jobIndex)
			}
		}()
	}

	for i := 0; i < total; i++ {
		jobs <- i
	}

	close(jobs)

	wg.Wait()
}
