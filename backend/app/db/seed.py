from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

CATEGORIES = [
    ("Hamburguesas", "Clásicos de la casa, hechos en el momento."),
    ("Pizzas", "Masa artesanal y sabores para compartir."),
    ("Bebidas", "Opciones frías para acompañar el pedido."),
]

PRODUCTS = [
    ("Doble cheddar", "Dos medallones, cheddar, cebolla y salsa de la casa.", 8900, 20, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85", "Hamburguesas"),
    ("Clásica de la casa", "Medallón, lechuga, tomate y mayonesa casera.", 7200, 18, "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85", "Hamburguesas"),
    ("Burger veggie", "Medallón de garbanzo, palta y hojas verdes.", 7800, 12, "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=85", "Hamburguesas"),
    ("Muzzarella", "Salsa de tomate, mozzarella y oliva.", 10500, 14, "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85", "Pizzas"),
    ("Napolitana", "Muzzarella, tomate fresco, ajo y albahaca.", 11900, 10, "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85", "Pizzas"),
    ("Fugazzeta", "Cebolla dorada, mozzarella y orégano.", 12400, 9, "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85", "Pizzas"),
    ("Limonada", "Limonada natural con menta.", 2600, 40, "https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?auto=format&fit=crop&w=900&q=85", "Bebidas"),
    ("Cola 500 ml", "Gaseosa clásica bien fría.", 2200, 35, "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=900&q=85", "Bebidas"),
]


def seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        if not session.exec(select(Usuario).where(Usuario.username == "admin")).first():
            session.add(Usuario(username="admin", full_name="Administración Food Store", email="admin@foodstore.local", hashed_password=hash_password("Admin1234!"), role="admin"))
        categories: dict[str, Categoria] = {}
        for name, description in CATEGORIES:
            category = session.exec(select(Categoria).where(Categoria.nombre == name)).first()
            if category is None:
                category = Categoria(nombre=name, descripcion=description)
                session.add(category)
                session.flush()
            categories[name] = category
        session.flush()
        for name, description, price, stock, image, category_name in PRODUCTS:
            existing = session.exec(select(Producto).where(Producto.nombre == name)).first()
            if existing is None:
                session.add(Producto(categoria_id=categories[category_name].id, nombre=name, descripcion=description, precio_base=price, imagen_url=image, stock=stock, disponible=True, activo=True))
        session.commit()


if __name__ == "__main__":
    seed()
    print("Seed listo: admin / Admin1234!")
