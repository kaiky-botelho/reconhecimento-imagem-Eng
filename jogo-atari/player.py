import pygame
from settings import *
from projectile import Projectile

class Player(pygame.sprite.Sprite):
    def __init__(self, all_sprites, projectiles):
        super().__init__()
        self.image = pygame.Surface((PLAYER_WIDTH, PLAYER_HEIGHT))
        self.image.fill(PLAYER_COLOR)
        self.rect = self.image.get_rect()
        
        # Inicia centralizado na parte de baixo da tela
        self.rect.centerx = WIDTH // 2
        self.rect.bottom = HEIGHT - 10
        
        # Guarda as referências dos grupos para poder adicionar tiros
        self.all_sprites = all_sprites
        self.projectiles = projectiles
        
        self.speed = PLAYER_SPEED

    def update(self):
        # Captura as teclas pressionadas para mover o jogador
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            self.rect.x -= self.speed
        if keys[pygame.K_RIGHT]:
            self.rect.x += self.speed
            
        # Garante que o jogador não ultrapasse os limites da tela
        if self.rect.left < 0:
            self.rect.left = 0
        if self.rect.right > WIDTH:
            self.rect.right = WIDTH

    def shoot(self):
        # Cria um novo tiro na posição atual da nave
        projectile = Projectile(self.rect.centerx, self.rect.top)
        self.all_sprites.add(projectile)
        self.projectiles.add(projectile)
