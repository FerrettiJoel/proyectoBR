import express from "express";
import fs from "fs/promises";
import path from "path";
import markdownIt from "markdown-it";
import fm from "front-matter";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(
  "C:/Users/DELL/Documents/programas/node/expressSSG/public"
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("views", path.join(__dirname, "pages"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));

//Rutas dinamicas desde archivos en la carpeta "pages"
const pageDir = path.join(__dirname, "pages");
const files = await fs.readdir(pageDir);

//Aqui logica para archivos html y md
for (let file of files) {
  const filePath = path.join(pageDir, file);
  let extName = path.extname(file);
  console.log(file, filePath, extName);

  if (extName === ".md" || extName === ".pug" || extName === ".html") {
    let fileName = path.basename(file, extName);
    console.log(fileName);
    app.get(`/${fileName}`, async (req, res) => {
      try {
        if (extName === ".pug") {
          res.render(fileName);
        }

        if (extName === ".html") {
          res.sendFile(filePath);
        }

        if (extName === ".md") {
          let fileContent = await fs.readFile(filePath, "utf-8");
          let { attributes: frontMatterAtributes, body } = fm(fileContent);
          let attributes = frontMatterAtributes;
          let content = markdownIt().render(body);
          res.render("layout-markdown", { ...attributes, content });
        }
      } catch (err) {
        res.status(404).render("error");
      }
    });
  }
}

//ruta del home
app.get("/", (req, res) => {
  res.render("index");
});

//Error 404
app.use((req, res) => {
  res.status(404).render("error");
});

app.listen(port, () =>
  console.log(`Sitio web corriendo en http://localhost:${port}`)
);
