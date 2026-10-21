export async function register() {
  // Ambiente corporativo com proxy SSL self-signed (comum em redes AMD/enterprise)
  if (process.env.NODE_ENV === "development" && process.env.ALLOW_INSECURE_TLS === "1") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }
}
