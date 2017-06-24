module.exports = {
  apps: [
    {
      name: "weather_server",
      script: "server.js",
      cwd: "/opt/weather-station",
      error_file: "/opt/weather-station/logs/error.log",
      out_file: "/opt/weather-station/logs/info.log",
      merge_logs: true,
      env: {
        NODE_ENV: "development"
      }
    }
  ]
}