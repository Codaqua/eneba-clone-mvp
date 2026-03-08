from backend.database import SessionLocal
from backend import models

db = SessionLocal()

try:
    mock_games = [
        {"title": "The Last of Us Part I", "description": "Experience the emotional storytelling and unforgettable characters.", "price": 69.99, "discount": 10.0, "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=TLOU+Part+I", "platform": models.PlatformEnum.PS5, "stock": 50},
        {"title": "God of War Ragnarok", "description": "Embark on an epic and heartfelt journey as Kratos and Atreus struggle with holding on and letting go.", "price": 59.99, "discount": 0.0, "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=GOW+Ragnarok", "platform": models.PlatformEnum.PS5, "stock": 30},
        {"title": "Halo Infinite", "description": "The legendary Halo series returns with the most expansive Master Chief campaign yet.", "price": 49.99, "discount": 20.0, "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=Halo+Infinite", "platform": models.PlatformEnum.Xbox, "stock": 100},
        {"title": "Forza Horizon 5", "description": "Lead breathtaking expeditions across the vibrant and ever-evolving open world landscapes of Mexico.", "price": 39.99, "discount": 15.0, "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=Forza+Horizon+5", "platform": models.PlatformEnum.Xbox, "stock": 45},
        {"title": "Cyberpunk 2077", "description": "An open-world, action-adventure RPG set in the megalopolis of Night City.", "price": 29.99, "discount": 50.0, "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=Cyberpunk+2077", "platform": models.PlatformEnum.PC, "stock": 120},
        {"title": "Elden Ring", "description": "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.", "price": 59.99, "discount": 5.0, "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=Elden+Ring", "platform": models.PlatformEnum.PC, "stock": 200},
        {"title": "The Legend of Zelda: Tears of the Kingdom", "description": "An epic adventure across the land and skies of Hyrule awaits.", "price": 69.99, "discount": 0.0, "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=Zelda+TOTK", "platform": models.PlatformEnum.Switch, "stock": 80},
        {"title": "Super Mario Bros. Wonder", "description": "Find wonder in the next evolution of Mario fun.", "price": 59.99, "discount": 0.0, "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=Mario+Wonder", "platform": models.PlatformEnum.Switch, "stock": 150},
        {"title": "Red Dead Redemption 2", "description": "Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores.", "price": 39.99, "discount": 33.0, "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=RDR2", "platform": models.PlatformEnum.PC, "stock": 300},
        {"title": "Spider-Man 2", "description": "Spider-Men, Peter Parker and Miles Morales, return for an exciting new adventure.", "price": 69.99, "discount": 5.0, "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=Spider-Man+2", "platform": models.PlatformEnum.PS5, "stock": 110},
        {"title": "Starfield", "description": "Starfield is the first new universe in over 25 years from Bethesda Game Studios.", "price": 69.99, "discount": 15.0, "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=Starfield", "platform": models.PlatformEnum.Xbox, "stock": 90},
        {"title": "Animal Crossing: New Horizons", "description": "Escape to a deserted island and create your own paradise.", "price": 49.99, "discount": 10.0, "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=Animal+Crossing", "platform": models.PlatformEnum.Switch, "stock": 250},
    ]

    added_count = 0
    for game_data in mock_games:
        existing_game = db.query(models.Product).filter(models.Product.title == game_data["title"]).first()
        if not existing_game:
            new_game = models.Product(**game_data)
            db.add(new_game)
            added_count += 1
            
    if added_count > 0:
        db.commit()
        print(f"Successfully seeded {added_count} games into the database.")
    
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
