declare module 'typed-error' {
    class TypedError {
        constructor(message: Error | string);
    }

    export = TypedError;
}
