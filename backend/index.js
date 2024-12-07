const mysql = require('mysql');
const cors = require('cors')
const express = require('express');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/photos', express.static('photos'));
app.use(express.static('../frontend'));


const PORT = 8009;

app.listen(PORT, function(){
    console.log("Servidor corriendo en http://localhost:"+PORT)
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'MinimalMarket'
});

db.connect(function(err){
    if(err) {
        throw err;
        db.end()
    }else{
        console.log("Conectado a la database EcoAura")
    }
})

app.get("/usuarios", function(req, res){
    db.query("SELECT * FROM usuarios", function(err, rows){
        if(err) throw err;
        res.send(rows);
    });
});
app.get("/usuarios/:id", function(req, res) {
    const { id } = req.params;
    db.query("SELECT * FROM usuarios WHERE id = ?", [id], function(err, row) {
        if (err) throw err;
        res.send(row);
    });
});

app.post("/usuarios", function(req, res){
    const { username, password } = req.body;
    const query = "INSERT INTO usuarios (username, password) VALUES (?, ?)";
    db.query(query, [username, password], function(err, rows){
        if(err){ 
            console.error(err);
            res.status(500).json({error: "Error al crear usuario"})
            return;
        }else{
            res.json({message: "usuario creado con exito", data: rows})
        }
    });
});

app.put("/usuarios/:id", function(req, res){
    const { id } = req.params;
    const { username, password} = req.body;
    const query = "UPDATE usuarios SET username = ?, password = ? WHERE id = ?";
    db.query(query, [username, password, id], function(err, rows){
        if(err) throw err;
        res.send("Actualizado: " + rows);
    });
});

app.delete("/usuarios/:id", function(req, res){
    const { id } = req.params;
    const query = "DELETE FROM usuarios WHERE id = ?";
    db.query(query, [id], function(err, rows){
        if(err) throw err;
        res.send("Eliminado: " + rows);
    });
});

app.post("/login", function (req, res) {
    const { username, password } = req.body;
    const query = "SELECT * FROM usuarios WHERE username = ? AND password = ?";
    db.query(query, [username, password], function (err, rows) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Error en el servidor" });
            return;
        }
        if (rows.length > 0) {
            res.json({ message: "Inicio de sesión exitoso", user: rows[0] });
        } else {
            res.status(401).json({ error: "Credenciales incorrectas" });
        }
    });
});
app.get("/productos", function(req, res){
    db.query("SELECT * FROM productos WHERE stock > 0", function(err, rows){
        if(err) {
            console.error(err);
            res.status(500).json({error: "Error al obtener productos"})
            return;
        }
        const productos = rows.map((producto) => {
            return {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                stock: producto.stock,
                foto: "http://localhost:8009/photos/"+producto.foto
            }
        })
        res.json(productos);
    });
});
app.get("/productos/:id", function (req, res) {
    const { id } = req.params;
    db.query("SELECT * FROM productos WHERE id = ?", [id], function (err, rows) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Error al obtener el producto" });
            return;
        }
        if (rows.length === 0) {
            res.status(404).json({ error: "Producto no encontrado" });
            return;
        }
        const producto = rows[0];
        producto.foto = "http://localhost:8009/photos/"+producto.foto;
        res.json(producto);
    });
});

app.post("/carrito", function(req, res){
    const { id_usuario, id_producto } = req.body;
    const query = "INSERT INTO carrito (id_usuario, id_producto) VALUES (?, ?)";
    db.query(query, [id_usuario, id_producto], function(err, rows){
        if(err){ 
            console.error(err);
            res.status(500).json({error: "Error al agregar al carrito"})
            return;
        }else{
            res.json({message: "Producto agregado con exito", data: rows})
        }
    });
});

app.delete("/carrito/usuario/:id", function (req, res) {

    const id_usuario = parseInt(req.params.id, 10);
    const selectQuery = "SELECT id_producto FROM carrito WHERE id_usuario = ?";
    db.query(selectQuery, [id_usuario], function (err, productos) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Error al obtener productos del carrito" });
            return;
        }
        if (productos.length === 0) {
            res.status(400).json({ message: "El carrito está vacío" });
            return;
        }

        const updateStockQueries = productos.map((producto) => {
            return new Promise((resolve, reject) => {
                const updateQuery = "UPDATE productos SET stock = stock - 1 WHERE id = ? AND stock > 0";
                db.query(updateQuery, [producto.id_producto], function (err, result) {
                    if (err) {
                        reject(err);
                    } else if (result.affectedRows === 0) {
                        reject(new Error(`El producto con id ${producto.id_producto} no tiene suficiente stock`));
                    } else {
                        resolve();
                    }
                });
            });
        });
        Promise.all(updateStockQueries)
            .then(() => {
                const deleteQuery = "DELETE FROM carrito WHERE id_usuario = ?";
                db.query(deleteQuery, [id_usuario], function (err, rows) {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ error: "Error al comprar los productos" });
                    } else {
                        res.json({ message: "Productos comprados con éxito", data: rows });
                    }
                });
            })
            .catch((err) => {
                console.error(err.message);
                res.status(500).json({ error: "Error al actualizar el stock de los productos", details: err.message });
            });
    });
});

app.delete("/carrito/:id", function(req, res){
    const { id } = req.params;
    const query = "DELETE FROM carrito WHERE id = ?";
    db.query(query, [id], function(err, rows){
        if(err) throw err;
        res.send("Eliminado: " + rows);
    });
});
app.get("/carrito/:id", function(req, res){
    const id_usuario = parseInt(req.params.id, 10);
    const query = "SELECT carrito.id, carrito.id_producto, productos.nombre, productos.precio, CONCAT('http://localhost:8009/photos/', productos.foto) AS foto  FROM carrito INNER JOIN productos ON carrito.id_producto = productos.id WHERE carrito.id_usuario = ?"
    db.query(query, [id_usuario], function(err, rows){
        if(err){
            console.error(err);
            res.status(500).json({error: "Error al obtener los productos del carrito"});
            return;
        }else{
            res.json(rows);
        }
    })
});

app.get("/historial/usuario/:id", function(req, res){
    const id_usuario = parseInt(req.params.id, 10);
    const query = "SELECT * FROM historial WHERE id_usuario = ? ORDER BY timestamp DESC";
    db.query(query, [id_usuario], function(err, rows){
        if(err){
            console.error(err);
            res.status(500).json({error: "Error al obtener el historial del usuario"});
            return;
        }else{
            res.json(rows);
        }
    })
});

app.post("/historial", function(req, res){
    const { id_usuario, productos, total, } = req.body;
    const query = "INSERT INTO historial SET ?";
    const data = {
        id_usuario: id_usuario,
        productos: productos,
        total: total,
    }
    db.query(query, data, function(err, rows){
    if(err) throw err;
    res.send("Historial agregado");
    });


})
