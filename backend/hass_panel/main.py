import os
import sys
sys.path.append('.')
import uvicorn
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware
from hass_panel.core.middlewares import proc_custom_exception
from hass_panel.routers import update, user_config, common, auth, users, hass, daily_quote, onvif_ctl
from hass_panel.core.initial import lifespan
from hass_panel.utils.config import cfg
ROUTERS = [
    common.router,
    update.router,
    user_config.router,
    auth.router,
    users.router,
    hass.router,
    daily_quote.router,
    onvif_ctl.router
]


app = FastAPI(
    title=cfg.base.name.upper(), 
    lifespan=lifespan,
)



# ROUTERS
for r in ROUTERS:
    app.include_router(r)

# MIDDLEWARE
cors_origins = [origin.strip() for origin in os.environ.get("HASS_PANEL_CORS_ORIGINS", "").split(",") if origin.strip()]
if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )
app.add_middleware(BaseHTTPMiddleware, dispatch=proc_custom_exception)



if __name__ == '__main__':
    print(f"Starting {cfg.base.name} on port {cfg.base.web_port}, env: {cfg.base.env}")
    uvicorn.run(
        app='main:app', 
        host="0.0.0.0", 
        port=cfg.base.web_port, 
        reload=cfg.base.debug
    )
