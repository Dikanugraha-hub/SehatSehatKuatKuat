# Stage 1: Build
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go.mod (cache layer — hanya re-download kalau go.mod berubah)
COPY go.mod ./
RUN go mod download

# Copy seluruh source
COPY . .

# Build binary statis (tidak butuh libc di runtime)
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server/main.go

# Stage 2: Runner
FROM alpine:3.19 AS runner

WORKDIR /app

# ca-certificates diperlukan supaya scraper bisa hit HTTPS
RUN apk --no-cache add ca-certificates

# Copy hanya binary dari stage builder
COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server", "-addr", ":8080"]