const medusaUrl =
    __MEDUSA_BACKEND_URL__ ||
    import.meta.env.VITE_MEDUSA_BACKEND_URL ||
    "http://localhost:9000"

export { medusaUrl }
