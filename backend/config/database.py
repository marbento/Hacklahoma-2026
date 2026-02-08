from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db]

    await db.users.create_index("email", unique=True)
    await db.goals.create_index("user_id")
    await db.goal_logs.create_index([("goal_id", 1), ("date", -1)])
    await db.assignments.create_index([("user_id", 1), ("due_at", 1)])
    await db.assignments.create_index([("user_id", 1), ("canvas_id", 1)], unique=True, sparse=True)
    await db.progress.create_index([("user_id", 1), ("date", -1)])

    print(f"Connected to MongoDB: {settings.mongodb_db}")


async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db():
    return db
