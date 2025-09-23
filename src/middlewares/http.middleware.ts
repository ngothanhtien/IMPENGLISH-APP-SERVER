import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../constants/http.constant";

export const httpHandler = (err: Error,req: Request,res: Response,next: NextFunction) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    switch (statusCode) {
        case HttpStatus.BAD_REQUEST:
            res.json({
                title: "BAD REQUEST",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case HttpStatus.UNAUTHORIZED:
            res.json({
                title: "UNAUTHORIZED",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case HttpStatus.BAD_GATEWAY:
            res.json({
                title: "BAD GATEWAY",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case HttpStatus.FORBIDDEN:
            res.json({
                title: "FORBIDDEN",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case HttpStatus.INTERNAL_SERVER_ERROR:
            res.json({
                title: "INTERNAL SERVER ERROR",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case HttpStatus.NOT_FOUND:
            res.json({
                title: "NOT FOUND",
                message: err.message,
                stackTrace: err.stack
            });
            break;  
        default:
            console.log("No error");
            break;
    }
}