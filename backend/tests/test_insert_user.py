import sys
import os

sys.path.append('.')
sys.path.append('./hass_panel')
from hass_panel.DAO.DAO import *

def init_admin():
    admin_username = os.environ.get("HASS_PANEL_TEST_ADMIN_USERNAME", "admin")
    admin_password = os.environ.get("HASS_PANEL_TEST_ADMIN_PASSWORD")
    if not admin_password:
        raise RuntimeError("Set HASS_PANEL_TEST_ADMIN_PASSWORD before creating a test admin")
    
    RoleDAO.registry('admin')
    UserDAO.register_urn(admin_username, admin_password, 'admin', ['admin'])
    print('create admin user success')
    
    
if __name__ == '__main__':
    init_admin()
