import pygame
from settings import *

class Projectile(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((PROJECTILE_WIDTH, PROJECTILE_HEIGHT))
        self.image.fill(PROJECTILE_COLOR)
        self.rect = self.image.get_rect()
        self.rect.centerx = x
        self.rect.bottom = y
        self.speed_y = PROJECTILE_SPEED

    def update(self):
        self.rect.y += self.speed_y
        # Destruir o objeto se ele sair pelo topo da tela para economizar memória
        if self.rect.bottom < 0:
            self.kill()
