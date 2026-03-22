with open('vite.config.ts', 'r') as f:
    content = f.read()

proxy_block = """
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        }
      },
"""

content = content.replace("host: '0.0.0.0',\n      },", "host: '0.0.0.0',\n" + proxy_block + "      },")

with open('vite.config.ts', 'w') as f:
    f.write(content)
