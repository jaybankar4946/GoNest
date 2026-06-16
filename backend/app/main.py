from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"status": "ok"}

@app.get("/listings")
def listings():
    return [
        {"id": 1, "title": "Flat in Nashik", "city": "Nashik"},
        {"id": 2, "title": "House in Mumbai", "city": "Mumbai"}
    ]