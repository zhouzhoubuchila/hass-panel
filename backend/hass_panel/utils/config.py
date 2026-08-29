import toml
from omegaconf import OmegaConf
import os
from hass_panel.utils.security import resolve_jwt_secret

def is_running_in_docker():
    return os.path.exists('/.dockerenv') or os.path.exists('/run/.containerenv')

cfg_type = 'prod' if is_running_in_docker() else 'dev'

config_path = f'config/{cfg_type}.toml'

def read_config(config_path):
    with open(config_path, "r") as cfg_fp:
        cfg = toml.load(cfg_fp)
    cfg.setdefault("security", {})["SECRET_KEY"] = resolve_jwt_secret(cfg)
    return OmegaConf.create(cfg)

cfg = read_config(config_path)
