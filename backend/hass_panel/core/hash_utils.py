from passlib.context import CryptContext
import hashlib
import hmac
from hass_panel.utils.config import cfg

schemes = cfg.security.schemes


# 用于校验和哈希password
pwd_context = CryptContext(schemes=schemes, deprecated="auto")


def hash_password(password: str) -> str:
    """
    使用服务端自带随机盐的 bcrypt 保存前端传来的密码摘要。
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码
    :param plain_password: 前端加密后的密码
    :param hashed_password: 数据库中存储的密码
    :return: bool
    """
    if not hashed_password:
        return False
    if pwd_context.identify(hashed_password):
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except (TypeError, ValueError):
            return False
    # v1.4.0 兼容：旧数据库直接存储了前端 MD5；首次成功登录后会自动升级。
    return hmac.compare_digest(plain_password, hashed_password)


def password_needs_rehash(hashed_password: str) -> bool:
    return not pwd_context.identify(hashed_password) or pwd_context.needs_update(hashed_password)

def md5_hash(text: str) -> str:
    """
    MD5哈希函数(提供给前端参考)
    :param text: 原始文本
    :return: MD5哈希值
    """
    return hashlib.md5(text.encode()).hexdigest()
