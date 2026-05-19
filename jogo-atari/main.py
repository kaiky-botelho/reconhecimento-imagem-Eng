import pygame
import sys
from settings import *
from player import Player
from asteroid import Asteroid

class Game:
    def __init__(self):
        # Inicializa a biblioteca pygame
        pygame.init()
        pygame.display.set_caption("Atari Space Shooter")
        
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont(None, 36)
        self.large_font = pygame.font.SysFont(None, 72)
        
        self.reset_game()

    def reset_game(self):
        # Reinicia o estado do jogo e as entidades
        self.all_sprites = pygame.sprite.Group()
        self.asteroids = pygame.sprite.Group()
        self.projectiles = pygame.sprite.Group()

        # Cria o jogador e passa as referências dos grupos
        self.player = Player(self.all_sprites, self.projectiles)
        self.all_sprites.add(self.player)

        self.score = 0
        self.spawn_timer = 0
        self.current_spawn_rate = INITIAL_SPAWN_RATE
        self.current_min_speed = INITIAL_MIN_SPEED
        self.current_max_speed = INITIAL_MAX_SPEED
        self.game_over = False

    def run(self):
        # Loop principal do jogo
        running = True
        while running:
            self.clock.tick(FPS)
            self.events()
            self.update()
            self.draw()
            
        pygame.quit()
        sys.exit()

    def events(self):
        # Verifica eventos, como fechar a janela ou apertar botões
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            # Apertar botões pontuais (não contínuos como andar)
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE and not self.game_over:
                    self.player.shoot()
                if event.key == pygame.K_r and self.game_over:
                    self.reset_game()

    def update(self):
        # Atualiza a lógica (só se não for Game Over)
        if not self.game_over:
            self.all_sprites.update()
            
            # Calcular nível de dificuldade (aumenta a cada 50 pontos)
            difficulty_level = self.score // 50
            
            # Reduz o tempo de spawn gradativamente (até um limite mínimo rápido de 20 frames)
            self.current_spawn_rate = max(20, INITIAL_SPAWN_RATE - (difficulty_level * 5))
            
            # Aumenta a velocidade máxima e mínima gradualmente
            self.current_min_speed = INITIAL_MIN_SPEED + (difficulty_level // 2)
            self.current_max_speed = INITIAL_MAX_SPEED + (difficulty_level // 2)
            
            # Lógica para criar novos asteroides periodicamente
            self.spawn_timer += 1
            if self.spawn_timer >= self.current_spawn_rate:
                self.spawn_timer = 0
                asteroid = Asteroid(int(self.current_min_speed), int(self.current_max_speed))
                self.all_sprites.add(asteroid)
                self.asteroids.add(asteroid)

            # Colisão: Tiro acerta Asteroide
            # True, True faz com que ambos sejam destruídos/apagados do grupo
            hits = pygame.sprite.groupcollide(self.asteroids, self.projectiles, True, True)
            for hit in hits:
                self.score += 10 # Aumenta a pontuação

            # Colisão: Nave bate num Asteroide
            hits = pygame.sprite.spritecollide(self.player, self.asteroids, False)
            if hits:
                self.game_over = True
            
            # Verifica se algum asteroide passou da tela (fundo)
            for asteroid in self.asteroids:
                if asteroid.rect.top > HEIGHT:
                    self.game_over = True

    def draw(self):
        # Limpa a tela com o fundo preto
        self.screen.fill(BLACK)
        
        # Desenha todos os sprites daquele grupo
        self.all_sprites.draw(self.screen)
        
        # Desenhar pontuação
        score_text = self.font.render(f"Score: {self.score}", True, WHITE)
        self.screen.blit(score_text, (10, 10))

        # Desenhar tela de Game Over
        if self.game_over:
            # Fundo semi-transparente para dar destaque ao Game Over
            overlay = pygame.Surface((WIDTH, HEIGHT))
            overlay.set_alpha(180)
            overlay.fill(BLACK)
            self.screen.blit(overlay, (0, 0))

            # Título GAME OVER
            title = self.large_font.render("GAME OVER", True, RED)
            title_rect = title.get_rect(center=(WIDTH/2, HEIGHT/2 - 50))
            
            # Pontuação final
            score_final = self.font.render(f"Pontuação Final: {self.score}", True, WHITE)
            score_rect = score_final.get_rect(center=(WIDTH/2, HEIGHT/2 + 10))
            
            # Instrução de restart
            restart_text = self.font.render("Pressione 'R' para reiniciar", True, YELLOW)
            restart_rect = restart_text.get_rect(center=(WIDTH/2, HEIGHT/2 + 60))

            self.screen.blit(title, title_rect)
            self.screen.blit(score_final, score_rect)
            self.screen.blit(restart_text, restart_rect)

        # Atualiza a janela, exibindo o que foi desenhado neste frame
        pygame.display.flip()

if __name__ == "__main__":
    game = Game()
    game.run()
