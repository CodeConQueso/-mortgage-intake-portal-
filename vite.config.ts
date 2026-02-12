import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'api-server',
          configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
              if (req.url === '/api/log' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => { body += chunk.toString(); });
                req.on('end', () => {
                  try {
                    const { level, message, data } = JSON.parse(body);
                    const color = level === 'error' ? '\x1b[31m' : '\x1b[32m';
                    const reset = '\x1b[0m';
                    console.log(`${color}[APP_${level.toUpperCase()}]${reset} ${message}`, data || '');
                  } catch (e) {}
                  res.end();
                });
              } else if (req.url === '/api/submit' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => { body += chunk.toString(); });
                req.on('end', async () => {
                  try {
                    const payload = JSON.parse(body);
                    const { Resend } = await import('resend');
                    const apiKey = env.RESEND_API_KEY;
                    
                    if (!apiKey || apiKey === 're_123456789') {
                      console.log('\x1b[33m[SERVER_WARN]\x1b[0m RESEND_API_KEY is missing or invalid in .env.local');
                      res.statusCode = 500;
                      res.end(JSON.stringify({ success: false, message: 'Resend API Key missing' }));
                      return;
                    }

                    const resend = new Resend(apiKey);
                    const { data, error } = await resend.emails.send({
                      from: 'Loan Portal <onboarding@resend.dev>',
                      to: [payload.to],
                      subject: payload.subject,
                      html: payload.html,
                      attachments: [
                        {
                          filename: `${payload.lastName}_1003.pdf`,
                          content: payload.pdf,
                        },
                        {
                          filename: `${payload.lastName}_1003.fnm`,
                          content: Buffer.from(payload.fnm).toString('base64'),
                        }
                      ],
                    });

                    if (error) {
                      console.log('\x1b[31m[SERVER_ERROR]\x1b[0m Resend Error:', error);
                      res.statusCode = 500;
                      res.end(JSON.stringify({ success: false, message: error.message }));
                    } else {
                      console.log('\x1b[32m[SERVER_INFO]\x1b[0m Email sent successfully:', data?.id);
                      res.statusCode = 200;
                      res.end(JSON.stringify({ success: true }));
                    }
                  } catch (e: any) {
                    console.log('\x1b[31m[SERVER_ERROR]\x1b[0m', e.message);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ success: false, message: e.message }));
                  }
                });
              } else {
                next();
              }
            });
          }
        }
      ],
      define: {
        'process.env.RESEND_API_KEY': JSON.stringify(env.RESEND_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
