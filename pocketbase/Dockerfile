FROM golang:1.25-alpine AS builder

WORKDIR /src

RUN apk add --no-cache build-base

COPY app/go.mod app/go.sum ./
RUN go mod download

COPY app/. .

RUN CGO_ENABLED=1 go build -o /bin/pocketbaseapp .

FROM alpine:latest

RUN apk add --no-cache ca-certificates tzdata wget

WORKDIR /app

COPY --from=builder /bin/pocketbaseapp /app/pocketbaseapp

RUN mkdir -p /pb_data

EXPOSE 8090

HEALTHCHECK --interval=5s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --timeout=3 --output-document=- http://localhost:8090/api/ > /dev/null || exit 1

ENTRYPOINT ["/app/pocketbaseapp"]
