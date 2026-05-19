import pygame
import random
from settings import *

class Asteroid(pygame.sprite.Sprite):
    def __init__(self, min_speed, max_speed):
        super().__init__()
        self.image = pygame.Surface((ASTEROID_WIDTH, ASTEROID_HEIGHT))
        self.image.fill(ASTEROID_COLOR)
        self.rect = self.image.get_rect()
        
        # Posição inicial aleatória horizontal no topo da tela, fora da visão do jogador
        self.rect.x = random.randrange(0, WIDTH - ASTEROID_WIDTH)
        self.rect.y = random.randrange(-100, -40)
        
        # Sorteia uma velocidade de queda de acordo com a dificuldade
        self.speed_y = random.randrange(min_speed, max_speed + 1)

    def update(self):
        self.rect.y += self.speed_y
