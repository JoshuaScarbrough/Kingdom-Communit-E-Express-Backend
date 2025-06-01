// Applications keys used for privacy and security
const BCRYPT_WORK_FACTOR = 12;
const SECRET_KEY = process.env.SECRET_KEY || "This-is-a-secret"
const COORDINATE_API_KEY = process.env.COORDINATE_API_KEY || "67f6b66b04e27418249266bfg8349e0"
const DISTANCE_API_KEY = process.env.DISTANCE_API_KEY || "AIzaSyCI945ibJRNL9raw6CC3v7Pusa3ryREBi8"

module.exports = {
    BCRYPT_WORK_FACTOR,
    SECRET_KEY,
    COORDINATE_API_KEY,
    DISTANCE_API_KEY
}