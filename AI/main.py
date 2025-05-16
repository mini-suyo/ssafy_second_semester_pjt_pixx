from fastapi import FastAPI
import uvicorn
import os

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "test입니당"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)