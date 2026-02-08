from fastapi.staticfiles import StaticFiles

def mount_static(app):
    app.mount(
        "/",
        StaticFiles(directory="client/dist", html=True),
        name="static"
    )
