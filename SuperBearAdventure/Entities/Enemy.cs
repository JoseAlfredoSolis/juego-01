using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using SuperBearAdventure.World;

namespace SuperBearAdventure.Entities
{
    public class Enemy : Entity
    {
        public EnemyType  Type         { get; }
        public int        Health        { get; protected set; } = 1;
        public bool       IsDefeated    => !IsActive;
        public float      SpeedMult     { get; set; } = 1f;

        protected float   _patrolRange;
        protected float   _startX;
        protected float   _startY;
        protected bool    _movingRight  = true;
        protected float   _chaseRange   = 260f;
        protected Vector2 _playerTarget;
        protected float   _flyTimer;
        protected float   _jumpTimer;

        private Color   _color;

        public Enemy(Vector2 position, EnemyType type, float patrolRange, Color bodyColor)
        {
            Type         = type;
            _patrolRange = patrolRange;
            _startX      = position.X;
            _startY      = position.Y;
            _color       = bodyColor;
            Position     = position;
            Size         = type == EnemyType.Flyer
                ? new Vector2(34, 30)
                : new Vector2(34, 38);
        }

        public override void Update(GameTime gameTime, List<Platform> platforms)
        {
            if (!IsActive) return;

            float dt = (float)gameTime.ElapsedGameTime.TotalSeconds;

            if (Type == EnemyType.Flyer)
            {
                UpdateFlyer(dt);
                return;
            }

            float speed = (Type == EnemyType.Chaser ? 140f : 100f) * SpeedMult;
            float vx = _movingRight ? speed : -speed;

            if (Type == EnemyType.Jumper && _jumpTimer <= 0f)
            {
                float dist = Math.Abs(_playerTarget.X - Position.X);
                if (dist < 280f && IsGrounded)
                {
                    _movingRight = _playerTarget.X > Position.X;
                    Velocity = new Vector2(_movingRight ? 220f : -220f, -520f);
                    _jumpTimer = 2.2f;
                }
            }
            if (_jumpTimer > 0f) _jumpTimer -= dt;

            Velocity = new Vector2(vx, Velocity.Y);
            StepPhysics(gameTime, platforms);

            if (Type == EnemyType.Patrol || Type == EnemyType.Jumper)
            {
                if (Position.X >= _startX + _patrolRange) _movingRight = false;
                if (Position.X <= _startX - _patrolRange) _movingRight = true;
                if (IsGrounded && !GroundAhead(platforms))
                    _movingRight = !_movingRight;
            }

            if (Velocity.X == 0f && Type != EnemyType.Jumper) _movingRight = !_movingRight;
        }

        private void UpdateFlyer(float dt)
        {
            float speed = 90f * SpeedMult;
            _flyTimer += dt;
            if (Position.X >= _startX + _patrolRange) _movingRight = false;
            if (Position.X <= _startX - _patrolRange) _movingRight = true;
            float vx = _movingRight ? speed : -speed;
            float y  = _startY + MathF.Sin(_flyTimer * 3f) * 36f;
            Position = new Vector2(Position.X + vx * dt, y);
        }

        private bool GroundAhead(List<Platform> platforms)
        {
            float frontX = _movingRight ? Position.X + Size.X + 2f : Position.X - 2f;
            var probe = new Rectangle((int)frontX, (int)(Position.Y + Size.Y + 2f), 2, 6);
            foreach (var p in platforms)
                if (probe.Intersects(p.Bounds)) return true;
            return false;
        }

        public void SetTarget(Vector2 playerPos) => _playerTarget = playerPos;

        public void ChasePlayer(Vector2 playerPos, GameTime gameTime)
        {
            _playerTarget = playerPos;
            if (Type == EnemyType.Chaser)
            {
                float dist = Math.Abs(playerPos.X - Position.X);
                if (dist < _chaseRange)
                    _movingRight = playerPos.X > Position.X;
            }
        }

        public virtual void Defeat()
        {
            Health--;
            if (Health <= 0)
                IsActive = false;
        }

        public override void Draw(SpriteBatch sb, Vector2 camPos)
        {
            if (!IsActive) return;
            int x = (int)(Position.X - camPos.X);
            int y = (int)(Position.Y - camPos.Y);

            Color body = Type == EnemyType.Flyer ? Color.SkyBlue : _color;
            DrawHelper.DrawRect(sb, x + 2, y + 10, 30, 28, body);
            DrawHelper.DrawRect(sb, x + 4, y, 26, 18, body);
            DrawHelper.DrawRect(sb, x + 7, y + 4, 6, 5, Color.Red);
            DrawHelper.DrawRect(sb, x + 21, y + 4, 6, 5, Color.Red);
            DrawHelper.DrawOutline(sb, new Rectangle(x + 2, y, 30, 38), Color.Black, 2);
            DrawHelper.DrawRect(sb, x + 4, y + 34, 10, 8, body);
            DrawHelper.DrawRect(sb, x + 20, y + 34, 10, 8, body);

            if (Type == EnemyType.Chaser || Type == EnemyType.Jumper)
            {
                DrawHelper.DrawRect(sb, x + 8, y + 14, 4, 5, Color.White);
                DrawHelper.DrawRect(sb, x + 14, y + 14, 4, 5, Color.White);
                DrawHelper.DrawRect(sb, x + 20, y + 14, 4, 5, Color.White);
            }
            if (Type == EnemyType.Flyer)
            {
                DrawHelper.DrawRect(sb, x - 4, y + 16, 12, 6, Color.LightBlue);
                DrawHelper.DrawRect(sb, x + 26, y + 16, 12, 6, Color.LightBlue);
            }
        }
    }
}
