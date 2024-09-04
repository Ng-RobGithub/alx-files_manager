const startServer = async (server, port, host = '0.0.0.0') => {
  server.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
  });
};

export default startServer;
