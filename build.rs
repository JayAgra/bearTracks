use static_files::resource_dir;

fn main() -> std::io::Result<()> {
    // include files in ./static/public in binary
    resource_dir("./static/public").build()
}