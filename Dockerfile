FROM node:22-slim

# Install curl (needed for the Bob installer) and CA certs
RUN apt-get update -qq && apt-get install -y -qq curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install Bob Shell non-interactively using the documented --pm flag (avoids the /dev/tty prompt entirely)
RUN curl -fsSL https://bob.ibm.com/download/bobshell.sh -o /tmp/bobshell.sh \
    && bash /tmp/bobshell.sh --pm npm \
    && rm /tmp/bobshell.sh

# Verify bob landed on PATH (fails the build loudly if not, instead of silently at runtime)
RUN which bob && bob --version

WORKDIR /app

# Install app dependencies first (better Docker layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Railway/Render set PORT via env var; make sure index.js listens on process.env.PORT
EXPOSE 3000

CMD ["node", "index.js"]
