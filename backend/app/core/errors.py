class DomainError(Exception):
    def __init__(self, detail: str, status_code: int = 400) -> None:
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


class NotFound(DomainError):
    def __init__(self, detail: str = "Recurso no encontrado") -> None:
        super().__init__(detail, 404)


class Conflict(DomainError):
    def __init__(self, detail: str) -> None:
        super().__init__(detail, 409)


class Forbidden(DomainError):
    def __init__(self, detail: str) -> None:
        super().__init__(detail, 403)
