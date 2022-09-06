// 몬스터의 HP바를 구현
class HealthBar {
    constructor(x, y, w, h, maxHealth, color) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.maxHealth = maxHealth;
      this.maxWidth = w;
      this.health = maxHealth;
      this.color = color;
    }
    
    // 일정 체력 이하면 HP바의 색깔을 변경
    show(context, health) {
      context.lineWidth = 4;
      context.strokeStyle = "#333";
      if (health > 50){
        context.fillStyle = this.color;
      } else if(health <= 50 && health > 20) {
        context.fillStyle = "yellow";
      } else if(health <= 20 && health > 0) {
        context.fillStyle = "red";
      }
      context.fillRect(this.x, this.y, this.w, this.h);
      context.strokeRect(this.x, this.y, this.maxWidth, this.h);
    }
    
    // hp 변경 메소드
    // 파라미터값 데미지
    updateHealth(val) {
      if (val >= 0) {
        this.health = val;
        this.w = (this.health / this.maxHealth) * this.maxWidth;
      }
    }
    
}