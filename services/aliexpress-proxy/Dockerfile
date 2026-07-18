# Imagen mínima: el servicio no tiene dependencias, solo módulos de Node.
FROM node:20-alpine

WORKDIR /app
COPY package.json server.js ./

# No corre como root: si alguien encuentra un fallo en el servicio, no hereda
# la máquina entera.
USER node

ENV PORT=3000
EXPOSE 3000

# Sonda de salud para que Docker (y IONOS) reinicien solos si se cuelga.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
