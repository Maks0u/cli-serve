A simple HTTP server built with Deno to easily serve local static files.

## Usage

You can run the server directly using `deno run`:

```
deno run --allow-net --allow-read jsr:@maks0u/cli-serve [options] [path]
```

## Options

| Option   | Description           | Default   |
| -------- | --------------------- | --------- |
| port     | Port to listen on     | 8080      |
| hostname | Hostname to listen on | localhost |
| path     | Path to serve         | ./static  |

## Examples

Serve the default `./static` directory:

```
deno run --allow-net --allow-read jsr:@maks0u/cli-serve
```

Serve the `./public` directory on port `3000`:

```
deno run --allow-net --allow-read jsr:@maks0u/cli-serve --port 3000 ./public
```

## Permissions

The script requires the following permissions:

-   `--allow-net`: to listen on the specified host and port.
-   `--allow-read`: to read static files from the specified directory.
