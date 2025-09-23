
export enum HttpStatus {
  OK = 200,

  // error client
  BAD_REQUEST = 400, // Invalid request
  UNAUTHORIZED = 401, // Authentication required but not available or invalid
  FORBIDDEN = 403, // No access to resources
  NOT_FOUND = 404, // Resource does not exist

  // error server
  INTERNAL_SERVER_ERROR = 500, // General server error
  BAD_GATEWAY = 502
}
