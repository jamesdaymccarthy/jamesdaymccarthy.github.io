//claude helped me a "little" bit

{
var level = 1;
var draggingBtn = -1;
var dragOffsetX = 0;
var dragOffsetY = 0;
var wrerthre = true;
var monsterabouttoeatthewolf = false;

// ============ FX + HINT SYSTEM ============
var fxParticles = [];
var shakeAmt = 0;
var flashAmt = 0;
var flashR = 255;
var flashG = 255;
var flashB = 255;
var fadeAmt = 0;
var stuckTimer = 0;
var showHint = false;   // true = glints/lines show up when you're stuck, false = no hints at all
var HINT_DELAY = 1500; // frames stuck before a glint shows up (~25 sec)

var burst = function(x, y, r, g, b, n, spd, grav) {
    for (var i = 0; i < n; i++) {
        var a = random(0, 360);
        var s = random(0.4, spd);
        fxParticles.push({
            x: x, y: y,
            vx: cos(a) * s,
            vy: sin(a) * s - (grav > 0 ? spd * 0.4 : 0),
            life: floor(random(20, 50)), max: 50,
            r: r, g: g, b: b,
            sz: random(2, 5), grav: grav
        });
    }
};
var shake = function(a) { shakeAmt = max(shakeAmt, a); };
var flash = function(r, g, b, a) {
    flashR = r; flashG = g; flashB = b;
    flashAmt = max(flashAmt, a);
};
var updateFx = function() {
    noStroke();
    for (var i = fxParticles.length - 1; i >= 0; i--) {
        var p = fxParticles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += p.grav; p.vx *= 0.97;
        p.life--;
        if (p.life <= 0) { fxParticles.splice(i, 1); continue; }
        var k = p.life / p.max;
        fill(p.r, p.g, p.b, 60 * k);
        ellipse(p.x, p.y, p.sz * 3 * k, p.sz * 3 * k);
        fill(p.r, p.g, p.b, 255 * k);
        ellipse(p.x, p.y, p.sz * k + 1, p.sz * k + 1);
    }
};
var drawGlint = function(x, y, phase) {
    var t = (frameCount + phase) % 150;
    if (t > 40) { return; }
    var k = sin(t / 40 * 180);
    var len = 4 + k * 9;
    noStroke();
    fill(255, 255, 230, 70 * k);
    ellipse(x, y, len * 1.6, len * 1.6);
    stroke(255, 255, 240, 230 * k);
    strokeWeight(1.5);
    line(x - len, y, x + len, y);
    line(x, y - len, x, y + len);
    strokeWeight(1);
    line(x - len * 0.45, y - len * 0.45, x + len * 0.45, y + len * 0.45);
    line(x - len * 0.45, y + len * 0.45, x + len * 0.45, y - len * 0.45);
    noStroke();
};

// ============ SHARED CHARACTER DRAWINGS (fox + purple monster) ============
// fox facing right; (x, y) is the middle of its body
var drawFoxDetailed = function(x, y, walking) {
    var lw = walking ? sin(frameCount * 8) * 4 : 0;
    noStroke();
    fill(0, 0, 0, 45); ellipse(x + 2, y + 19, 62, 6);
    // big bushy tail with a white tip
    pushMatrix();
    translate(x - 17, y - 1);
    rotate(-28 + sin(frameCount * 4) * 4);
    fill(205, 110, 35); ellipse(-14, 0, 32, 14);
    fill(225, 132, 48); ellipse(-12, -2, 24, 7);
    fill(250, 248, 240); ellipse(-28, 0, 11, 10);
    popMatrix();
    // far legs
    fill(150, 75, 25);
    rect(x - 13 - lw * 0.5, y + 4, 5, 13, 2); rect(x + 9 + lw * 0.5, y + 4, 5, 13, 2);
    fill(45, 30, 25);
    rect(x - 13 - lw * 0.5, y + 13, 5, 5, 2); rect(x + 9 + lw * 0.5, y + 13, 5, 5, 2);
    // body
    fill(205, 110, 35); ellipse(x, y, 40, 18);
    fill(225, 135, 50); ellipse(x - 2, y - 4, 30, 7);
    fill(250, 240, 225); ellipse(x + 6, y + 5, 22, 7);
    // near legs, with dark "socks"
    fill(195, 100, 30);
    rect(x - 9 + lw * 0.5, y + 4, 6, 14, 2); rect(x + 13 - lw * 0.5, y + 4, 6, 14, 2);
    fill(40, 25, 20);
    rect(x - 9 + lw * 0.5, y + 13, 6, 5, 2); rect(x + 13 - lw * 0.5, y + 13, 6, 5, 2);
    // neck + white chest
    fill(205, 110, 35); ellipse(x + 15, y - 4, 16, 16);
    fill(250, 245, 235); ellipse(x + 18, y + 1, 10, 10);
    // head
    fill(210, 115, 38); ellipse(x + 23, y - 11, 18, 15);
    // ears, on top of the head
    fill(205, 110, 35);
    triangle(x + 16, y - 15, x + 18, y - 28, x + 23, y - 17);
    triangle(x + 22, y - 17, x + 26, y - 29, x + 29, y - 15);
    fill(60, 30, 15);
    triangle(x + 17.5, y - 17, x + 18.5, y - 25, x + 21.5, y - 17.5);
    triangle(x + 23.5, y - 17.5, x + 26, y - 26, x + 27.5, y - 16);
    // pointy snout with a white jaw
    fill(210, 115, 38); triangle(x + 27, y - 15, x + 40, y - 8, x + 27, y - 6);
    fill(250, 245, 235); triangle(x + 27, y - 9, x + 39, y - 7, x + 27, y - 5);
    ellipse(x + 22, y - 7, 9, 6);
    fill(25); ellipse(x + 40, y - 8, 4, 3);
    // eye
    fill(30, 20, 10); ellipse(x + 27, y - 13, 4, 3);
    fill(255); ellipse(x + 27.6, y - 13.6, 1.2, 1.2);
};
// fox lying on its side (x eyes)
var drawFoxLying = function(x, y) {
    noStroke();
    fill(0, 0, 0, 40); ellipse(x, y + 12, 70, 6);
    fill(205, 110, 35); ellipse(x - 30, y + 7, 30, 11);
    fill(250, 248, 240); ellipse(x - 44, y + 7, 10, 9);
    fill(205, 110, 35); ellipse(x, y + 5, 42, 15);
    fill(250, 240, 225); ellipse(x + 2, y + 9, 26, 6);
    fill(195, 100, 30); rect(x - 10, y + 9, 14, 4, 2); rect(x + 8, y + 9, 14, 4, 2);
    fill(40, 25, 20); rect(x + 2, y + 9, 4, 4, 2); rect(x + 20, y + 9, 4, 4, 2);
    fill(210, 115, 38); ellipse(x + 20, y + 1, 18, 14);
    triangle(x + 14, y - 4, x + 12, y - 14, x + 19, y - 6);
    fill(60, 30, 15); triangle(x + 14.5, y - 5, x + 13.5, y - 11, x + 17.5, y - 6);
    fill(210, 115, 38); triangle(x + 26, y - 3, x + 38, y + 3, x + 26, y + 6);
    fill(250, 245, 235); triangle(x + 26, y + 3, x + 37, y + 4, x + 26, y + 6);
    fill(25); ellipse(x + 38, y + 3, 4, 3);
    stroke(0); strokeWeight(1);
    line(x + 20, y - 3, x + 24, y + 1); line(x + 24, y - 3, x + 20, y + 1);
    noStroke();
};
// purple monster facing right; (x, y) is the middle of its body, s = size
var drawPurpleMonster = function(x, y, s, r, g, b, glow) {
    var flap = sin(frameCount * 9) * 3 * s;
    var dr = r * 0.62; var dg = g * 0.62; var db = b * 0.72;
    noStroke();
    if (glow > 0) { fill(r, g, b, 50); ellipse(x, y, glow, glow); }
    // spiky tail
    stroke(dr, dg, db); strokeWeight(2.5 * s);
    line(x - 9 * s, y + 2 * s, x - 15 * s, y + 5 * s);
    line(x - 15 * s, y + 5 * s, x - 20 * s, y + 3 * s);
    noStroke();
    fill(dr, dg, db); triangle(x - 19 * s, y + 3 * s, x - 25 * s, y - 1 * s, x - 24 * s, y + 6.5 * s);
    // back wing
    fill(dr * 0.9, dg * 0.9, db * 0.9);
    triangle(x - s, y - 4 * s, x - 14 * s, y - 17 * s + flap, x - 21 * s, y - 8 * s + flap * 0.5);
    triangle(x - s, y - 4 * s, x - 21 * s, y - 8 * s + flap * 0.5, x - 15 * s, y - s);
    // front wing with ribs
    fill(r * 0.8, g * 0.8, b * 0.9);
    triangle(x + 2 * s, y - 5 * s, x - 8 * s, y - 20 * s + flap, x - 18 * s, y - 12 * s + flap);
    triangle(x + 2 * s, y - 5 * s, x - 18 * s, y - 12 * s + flap, x - 12 * s, y - 3 * s);
    stroke(dr * 0.7, dg * 0.7, db * 0.7); strokeWeight(0.8 * s);
    line(x + 2 * s, y - 5 * s, x - 8 * s, y - 20 * s + flap);
    line(x + 2 * s, y - 5 * s, x - 18 * s, y - 12 * s + flap);
    line(x + 2 * s, y - 5 * s, x - 12 * s, y - 3 * s);
    noStroke();
    // clawed feet
    fill(dr, dg, db); ellipse(x - 4 * s, y + 7 * s, 4 * s, 5 * s); ellipse(x + 4 * s, y + 7 * s, 4 * s, 5 * s);
    fill(240, 235, 250);
    triangle(x - 6 * s, y + 9 * s, x - 5.5 * s, y + 11 * s, x - 5 * s, y + 9 * s);
    triangle(x - 3 * s, y + 9 * s, x - 2.5 * s, y + 11 * s, x - 2 * s, y + 9 * s);
    triangle(x + 2 * s, y + 9 * s, x + 2.5 * s, y + 11 * s, x + 3 * s, y + 9 * s);
    triangle(x + 5 * s, y + 9 * s, x + 5.5 * s, y + 11 * s, x + 6 * s, y + 9 * s);
    // body + shading + striped belly
    fill(r, g, b); ellipse(x, y, 22 * s, 15 * s);
    fill(dr, dg, db, 150); arc(x, y + s, 22 * s, 13 * s, 0, 180);
    fill(min(255, r + 60), min(255, g + 60), min(255, b + 40)); ellipse(x + 2 * s, y + 2 * s, 12 * s, 7 * s);
    stroke(r * 0.85, g * 0.85, b * 0.9); strokeWeight(0.6 * s);
    line(x - 1 * s, y, x - 1 * s, y + 4 * s); line(x + 2 * s, y - 0.5 * s, x + 2 * s, y + 5 * s); line(x + 5 * s, y, x + 5 * s, y + 4 * s);
    noStroke();
    // spikes down the back
    fill(dr, dg, db);
    for (var k = 0; k < 4; k++) {
        triangle(x - 7 * s + k * 4 * s, y - 6 * s, x - 5 * s + k * 4 * s, y - 10 * s, x - 3 * s + k * 4 * s, y - 6 * s);
    }
    // head
    fill(r, g, b); ellipse(x + 11 * s, y - 3 * s, 14 * s, 12 * s);
    fill(255, 255, 255, 60); ellipse(x + 9 * s, y - 6 * s, 6 * s, 3 * s);
    // horns
    fill(240, 230, 250);
    triangle(x + 7 * s, y - 8 * s, x + 5 * s, y - 14 * s, x + 9.5 * s, y - 8.5 * s);
    triangle(x + 12 * s, y - 8.5 * s, x + 14 * s, y - 14 * s, x + 15 * s, y - 8 * s);
    // angry brows
    stroke(dr * 0.6, dg * 0.6, db * 0.6); strokeWeight(s);
    line(x + 6.5 * s, y - 6.5 * s, x + 10 * s, y - 5 * s); line(x + 11.5 * s, y - 5 * s, x + 15 * s, y - 6.5 * s);
    noStroke();
    // eyes (red with yellow and a slit pupil)
    fill(255, 50, 50); ellipse(x + 8.5 * s, y - 3 * s, 4.5 * s, 4.5 * s); ellipse(x + 13 * s, y - 3 * s, 4.5 * s, 4.5 * s);
    fill(255, 200, 0); ellipse(x + 8.5 * s, y - 3 * s, 2.6 * s, 2.6 * s); ellipse(x + 13 * s, y - 3 * s, 2.6 * s, 2.6 * s);
    fill(0); ellipse(x + 8.5 * s, y - 3 * s, 0.8 * s, 2.4 * s); ellipse(x + 13 * s, y - 3 * s, 0.8 * s, 2.4 * s);
    fill(255); ellipse(x + 7.9 * s, y - 3.9 * s, 0.9 * s, 0.9 * s); ellipse(x + 12.4 * s, y - 3.9 * s, 0.9 * s, 0.9 * s);
    // mouth + fangs
    stroke(dr * 0.4, dg * 0.4, db * 0.4); strokeWeight(0.7 * s);
    line(x + 8 * s, y + 1.5 * s, x + 16 * s, y + 0.8 * s);
    noStroke();
    fill(255);
    triangle(x + 9 * s, y + 1.5 * s, x + 10 * s, y + 4.5 * s, x + 11 * s, y + 1.4 * s);
    triangle(x + 12.5 * s, y + 1.3 * s, x + 13.3 * s, y + 3.8 * s, x + 14.2 * s, y + 1.2 * s);
    fill(dr * 0.5, dg * 0.5, db * 0.5); ellipse(x + 17 * s, y - 2 * s, s, s);
};

// the Altar Beast: rock body, wax candles, shadow smoke, a giant eye, tentacles,
// a screaming mouth, bone-spider legs and two soul jars. (x, y) = its middle.
var drawAltarBeast = function(x, y, s, lookX, lookY, angry) {
    var f = frameCount;
    pushMatrix();
    translate(x, y);
    scale(s);
    noStroke();
    // bone spider legs (jointed)
    for (var side = -1; side <= 1; side += 2) {
        for (var k = 0; k < 4; k++) {
            var sw = sin(f * 3 + k * 50 + side * 30) * 3;
            var hx = side * 32; var hy = 10 + k * 5;
            var kx = side * (58 + k * 5); var ky = -6 + k * 8 + sw;
            var fx = side * (72 + k * 3); var fy = 48 + k * 3;
            stroke(150, 140, 120); strokeWeight(6);
            line(hx, hy, kx, ky); line(kx, ky, fx, fy);
            stroke(220, 210, 190); strokeWeight(4);
            line(hx, hy, kx, ky); line(kx, ky, fx, fy);
            noStroke();
            fill(235, 225, 205); ellipse(kx, ky, 8, 8);
            fill(200, 190, 170); triangle(fx - 3, fy, fx + 3, fy, fx + side * 2, fy + 7);
        }
    }
    // tentacles (segmented, with suckers)
    for (var t = 0; t < 6; t++) {
        var base = t * 60 + f * 1.5;
        for (var j = 0; j < 9; j++) {
            var rr = 28 + j * 5;
            var a = base + sin(f * 2 + t * 40 + j * 25) * (6 + j * 2);
            var tx = cos(a) * rr * 1.25; var ty = sin(a) * rr * 0.95;
            var sz = 11 - j;
            fill(170, 145, 125); ellipse(tx, ty, sz, sz);
            fill(195, 170, 150); ellipse(tx - sz * 0.15, ty - sz * 0.15, sz * 0.6, sz * 0.6);
            if (j % 2 === 1) { fill(230, 140, 150); ellipse(tx + sz * 0.2, ty + sz * 0.2, sz * 0.3, sz * 0.3); }
        }
    }
    // shadow smoke curling up
    for (var w = 0; w < 5; w++) {
        var wy = -28 - ((f * 0.6 + w * 14) % 50);
        var wa = 140 - ((f * 0.6 + w * 14) % 50) * 2.6;
        fill(30, 10, 55, max(0, wa));
        ellipse(sin(f * 2 + w * 70) * 18, wy, 34 - w * 3, 26);
    }
    fill(20, 8, 40, 200); ellipse(0, -12, 74, 52);
    fill(30, 12, 55, 160); ellipse(-22, -22, 30, 40); ellipse(22, -22, 30, 40);
    // rock body with facets and glowing cracks
    fill(70, 56, 47); ellipse(0, 12, 88, 64);
    fill(95, 80, 68);
    quad(-40, 6, -22, -12, 0, -6, -14, 18);
    quad(8, -6, 30, -10, 42, 10, 18, 16);
    fill(55, 44, 37);
    quad(-30, 26, 0, 20, 10, 40, -18, 40);
    quad(14, 24, 38, 18, 30, 38, 12, 40);
    fill(120, 104, 90); ellipse(-20, -2, 14, 6); ellipse(24, 0, 10, 4);
    var glowA = 140 + sin(f * 4) * 80;
    stroke(255, 80, 220, glowA); strokeWeight(1.5);
    line(-34, 18, -24, 26); line(-24, 26, -26, 36);
    line(30, 22, 36, 30); line(36, 30, 34, 38);
    noStroke();
    // little crystals stuck in the rock
    fill(255, 90, 230, 200); triangle(-40, 20, -34, 4, -30, 20);
    fill(90, 230, 255, 200); triangle(36, 12, 41, -2, 45, 12);
    fill(255, 255, 255, 120); triangle(-37, 18, -34, 8, -33, 18);
    // wax candles on its shoulders
    for (var c = -1; c <= 1; c += 2) {
        var cx = c * 30; var cy = -18;
        fill(225, 205, 175); rect(cx - 6, cy - 14, 12, 20, 2);
        fill(210, 188, 158); rect(cx + 2, cy - 14, 4, 20);
        fill(235, 218, 190); ellipse(cx - 4, cy - 2, 5, 10); ellipse(cx + 3, cy + 2, 4, 8);
        var fl = sin(f * 14 + c * 50) * 1.5;
        fill(255, 220, 120, 60); ellipse(cx, cy - 20, 18, 22);
        fill(255, 200, 40); ellipse(cx + fl * 0.3, cy - 20, 6, 11 + fl);
        fill(255, 250, 200); ellipse(cx, cy - 18, 3, 5);
        stroke(40); strokeWeight(1); line(cx, cy - 14, cx, cy - 16); noStroke();
    }
    // soul jars on stalks
    for (var e = -1; e <= 1; e += 2) {
        var jx = e * 22; var jy = -46 + sin(f * 3 + e * 60) * 2;
        stroke(60, 30, 70); strokeWeight(4); line(e * 12, -20, jx, jy + 8); noStroke();
        fill(170, 210, 230, 150); ellipse(jx, jy, 18, 20);
        fill(150, 190, 210, 150); rect(jx - 7, jy - 9, 14, 8);
        fill(110, 70, 40); rect(jx - 6, jy - 13, 12, 5, 1);
        var sp = 160 + sin(f * 7 + e * 90) * 80;
        fill(200, 255, sp, 70); ellipse(jx, jy + 1, 16, 16);
        fill(210, 255, sp); ellipse(jx, jy + 1, 8, 9);
        fill(0, 90, 120); ellipse(jx - 2, jy, 2, 2); ellipse(jx + 2, jy, 2, 2);
        fill(255, 255, 255, 140); rect(jx - 6, jy - 4, 2, 9);
    }
    // giant eye
    fill(150, 120, 110); ellipse(0, -5, 52, 46);
    fill(235, 220, 205); ellipse(0, -5, 46, 40);
    fill(210, 190, 175); arc(0, -5, 46, 40, 0, 180);
    if (angry) { fill(255, 60, 60, 110); ellipse(0, -5, 46, 40); }
    stroke(205, 60, 60, 170); strokeWeight(1);
    line(-22, -9, -14, -7); line(-14, -7, -10, -10); line(-14, -7, -11, -3);
    line(22, -2, 13, -3); line(13, -3, 10, 1);
    line(-18, 6, -11, 2); line(17, 8, 11, 4);
    noStroke();
    var dx = (lookX - x) / s; var dy = (lookY - y) / s;
    var dd = max(1, sqrt(dx * dx + dy * dy));
    var px = dx / dd * min(6, dd * 0.05); var py = dy / dd * min(5, dd * 0.05);
    fill(90, 20, 140); ellipse(px, -5 + py, 26, 26);
    fill(160, 60, 210); ellipse(px, -5 + py, 22, 22);
    fill(200, 120, 240, 160); ellipse(px, -5 + py, 14, 14);
    fill(0); ellipse(px, -5 + py, 11, 13);
    fill(255, 255, 255, 220); ellipse(px + 5, -10 + py, 5, 5); ellipse(px - 4, py, 2, 2);
    // rocky eyelid
    fill(85, 70, 60); arc(0, -6, 52, 42, 200, 340);
    // screaming mouth
    fill(120, 30, 45); arc(0, 20, 48, 26, 0, 180);
    fill(50, 10, 20); arc(0, 21, 40, 20, 0, 180);
    fill(220, 90, 110); ellipse(4, 27, 18, 7);
    fill(235, 225, 205);
    for (var bt = 0; bt < 6; bt++) { triangle(-17 + bt * 6.5, 20, -14 + bt * 6.5, 27, -11 + bt * 6.5, 20); }
    for (var bb = 0; bb < 4; bb++) { triangle(-11 + bb * 7, 31, -8 + bb * 7, 26, -5 + bb * 7, 31); }
    popMatrix();
};

// songbird facing right; (x, y) is the middle of its body
var drawSongbird = function(x, y, s, r, g, b, phase, dead) {
    var flap = dead ? 0 : sin(frameCount * 17 + phase);
    var dr = r * 0.72; var dg = g * 0.72; var db = b * 0.72;
    pushMatrix();
    translate(x, y);
    scale(s);
    noStroke();
    // tail feathers
    fill(dr, dg, db);
    triangle(-6, -1, -17, -4, -15, 1);
    triangle(-6, 1, -18, 1, -15, 4);
    fill(dr * 0.85, dg * 0.85, db * 0.85); triangle(-6, 2, -16, 5, -13, 6);
    // far wing
    if (!dead) {
        pushMatrix(); translate(-1, -2); rotate(-25 - flap * 30);
        fill(dr * 0.8, dg * 0.8, db * 0.8); ellipse(-5, 0, 15, 6);
        popMatrix();
    }
    // body + speckled belly
    fill(r, g, b); ellipse(0, 0, 17, 11);
    fill(min(255, r + 55), min(255, g + 60), min(255, b + 60)); ellipse(2, 2.5, 11, 6);
    fill(dr, dg, db, 170); ellipse(1, 2, 1.3, 1.3); ellipse(4, 3, 1.3, 1.3); ellipse(-1, 4, 1.1, 1.1); ellipse(3, 0.5, 1, 1);
    // head + cheek
    fill(r, g, b); ellipse(8, -3, 10, 9);
    fill(min(255, r + 60), min(255, g + 60), min(255, b + 60)); ellipse(9.5, -1, 4, 3);
    fill(dr * 0.8, dg * 0.8, db * 0.8); ellipse(6, -6, 5, 2);
    // near wing with layered feathers
    pushMatrix(); translate(0, -1); rotate(dead ? 0 : flap * 35);
    fill(dr, dg, db); ellipse(-3, 0, 15, 7);
    fill(dr * 0.75, dg * 0.75, db * 0.75); ellipse(-7, 1.5, 9, 4); ellipse(-9, 0, 6, 3);
    fill(min(255, r + 25), min(255, g + 25), min(255, b + 25)); ellipse(-1, -1.5, 8, 3);
    popMatrix();
    // two-part beak
    fill(250, 185, 40); triangle(12, -4.5, 17.5, -3, 12, -2);
    fill(215, 140, 20); triangle(12, -2, 16, -2.2, 12, -0.8);
    // eye
    if (dead) {
        stroke(0); strokeWeight(0.9);
        line(8.6, -5.6, 11.2, -3); line(11.2, -5.6, 8.6, -3);
        noStroke();
    } else {
        fill(255, 255, 255, 120); ellipse(10, -4, 4, 4);
        fill(0); ellipse(10, -4, 2.6, 2.6);
        fill(255); ellipse(10.6, -4.6, 1, 1);
    }
    popMatrix();
};
// one faceted crystal column (cx, by = middle of its base)
var drawCrystalColumn = function(cx, by, w, h, tilt, r, g, b, a) {
    pushMatrix();
    translate(cx, by);
    rotate(tilt);
    noStroke();
    fill(r * 0.55, g * 0.55, b * 0.6, a); quad(-w / 2, 0, 0, 0, 0, -h * 0.76, -w / 2, -h * 0.7);
    fill(r, g, b, a); quad(0, 0, w / 2, 0, w / 2, -h * 0.7, 0, -h * 0.76);
    fill(r * 0.8, g * 0.8, b * 0.85, a); triangle(-w / 2, -h * 0.7, 0, -h * 0.76, 0, -h);
    fill(min(255, r + 70), min(255, g + 70), min(255, b + 70), a); triangle(0, -h * 0.76, w / 2, -h * 0.7, 0, -h);
    stroke(255, 255, 255, a * 0.55); strokeWeight(1);
    line(0, -1, 0, -h * 0.76); line(0, -h * 0.76, 0, -h);
    stroke(255, 255, 255, a * 0.25); line(w / 4, -2, w / 4, -h * 0.68);
    noStroke();
    popMatrix();
};

var drawDragHint = function(x1, y1, x2, y2, phase) {
    // dashed white line from the thing to where it goes, with a dot "carrying" it along
    var d = dist(x1, y1, x2, y2);
    if (d < 4) { drawGlint(x1, y1, phase); return; }
    var ux = (x2 - x1) / d; var uy = (y2 - y1) / d;
    var fadeIn = min(1, (stuckTimer - HINT_DELAY) / 40);
    var a = (150 + 60 * sin(frameCount * 4 + phase)) * fadeIn;
    stroke(255, 255, 255, a);
    strokeWeight(2);
    var off = (frameCount * 0.6) % 12;
    for (var s = off; s < d - 8; s += 12) {
        var e = min(s + 6, d - 8);
        line(x1 + ux * s, y1 + uy * s, x1 + ux * e, y1 + uy * e);
    }
    noFill();
    ellipse(x1, y1, 22, 22);
    noStroke();
    fill(255, 255, 255, a);
    triangle(x2, y2,
             x2 - ux * 10 - uy * 6, y2 - uy * 10 + ux * 6,
             x2 - ux * 10 + uy * 6, y2 - uy * 10 - ux * 6);
    // travelling dot
    var k = ((frameCount + phase) % 90) / 90;
    fill(255, 255, 255, 60 * fadeIn);
    ellipse(x1 + ux * d * k, y1 + uy * d * k, 14, 14);
    fill(255, 255, 255, 230 * fadeIn);
    ellipse(x1 + ux * d * k, y1 + uy * d * k, 6, 6);
    strokeWeight(1);
};

// ============ RAIN STUFF (shared: the secret route, level 9, and the R.A.I.N. ending) ============
var srHasRainKey = 0;
var cheatOn = 0;      // type "cheater" to see what to do (secret stuff only)
var cheatBuf = "";
var cheatSkipRel = 0;
var l4KeyGot = 0;   // the letter KEY from level 4 (opens the top-left door in level 9)
// everything outside a soft circle of light around (x, y) goes dark
var srDarkness = function(x, y, r, a) {
    if (a <= 0) { return; }
    var la = 255 * (1 - sqrt(sqrt(1 - min(a, 254) / 255)));
    noFill();
    for (var k = 3; k >= 0; k--) {
        stroke(0, 0, 0, la); strokeWeight(900);
        var d = (r + k * 16) * 2 + 900;
        ellipse(x, y, d, d);
    }
    noStroke(); strokeWeight(1);
};
var drawRainKey = function(x, y, s) {
    pushMatrix(); translate(x, y); scale(s);
    noStroke();
    fill(120, 200, 255, 45); ellipse(0, 0, 36, 36);
    // shaft + drippy teeth
    fill(140, 205, 245); rect(-2.5, 4, 5, 24, 1);
    rect(2, 17, 6, 3); rect(2, 23, 8, 3);
    ellipse(8, 20, 3, 4); ellipse(10, 26, 3, 4);
    // the bow is a raindrop
    fill(100, 185, 250); ellipse(0, -1, 20, 20); triangle(-9.6, -4, 9.6, -4, 0, -21);
    fill(40, 110, 190); ellipse(0, 0, 9, 9); triangle(-4.3, -1.5, 4.3, -1.5, 0, -10);
    fill(255, 255, 255, 210); ellipse(-5, -5, 3, 5);
    popMatrix();
};
var drawRainGuppy = function(x, y, s) {
    pushMatrix(); translate(x, y); scale(s);
    noStroke();
    fill(130, 200, 255, 40); ellipse(0, 2, 48, 48);
    // the raindrop he lives in
    fill(165, 218, 255, 105); ellipse(0, 5, 30, 30); triangle(-14.7, 1, 14.7, 1, 0, -24);
    // the guppy, swimming in little circles
    var a = frameCount * 3;
    var gx = cos(a) * 5; var gy = 6 + sin(a) * 3;
    var d = -sin(a) >= 0 ? 1 : -1;
    var flick = sin(frameCount * 20) * 1.5;
    pushMatrix(); translate(gx, gy); scale(d, 1);
    fill(150, 90, 255, 220); triangle(-4, 0, -12, -6 + flick, -12, 6 - flick);
    fill(80, 190, 255, 200); triangle(-4, 0, -10, -3 + flick, -10, 3 - flick);
    fill(255, 150, 60); ellipse(0, 0, 10, 6);
    fill(255, 215, 130); ellipse(1, 1, 6, 3);
    fill(255, 120, 40); triangle(-1, -2.5, 2, -2.5, -2, -5);
    fill(20); ellipse(3, -1, 1.8, 1.8);
    popMatrix();
    fill(255, 255, 255, 190); ellipse(-6, -1, 4, 7);
    popMatrix();
};
var drawLightningBolt = function(x1, y1, x2, y2, boltSeed, a) {
    var pts = [];
    for (var k = 0; k <= 9; k++) {
        var t = k / 9;
        var off = (k > 0 && k < 9) ? sin(boltSeed * 97 + k * 131) * 16 : 0;
        pts.push([x1 + (x2 - x1) * t + off, y1 + (y2 - y1) * t]);
    }
    for (var pass = 0; pass < 2; pass++) {
        if (pass === 0) { stroke(150, 200, 255, a * 0.45); strokeWeight(10); }
        else { stroke(255, 255, 255, a); strokeWeight(3); }
        for (var j = 0; j < 9; j++) { line(pts[j][0], pts[j][1], pts[j + 1][0], pts[j + 1][1]); }
    }
    noStroke(); strokeWeight(1);
};
// THE STORM FISH (what the rain guppy turns into). d = 1 faces right, -1 faces left
var drawStormFish = function(x, y, s, d) {
    pushMatrix(); translate(x, y); scale(s * d, s);
    noStroke();
    var fc = frameCount;
    var w = sin(fc * 8);
    // storm aura + rain orbiting him
    fill(50, 120, 255, 20); ellipse(0, 0, 200, 120);
    fill(120, 200, 255, 22); ellipse(0, 0, 156, 92);
    for (var o = 0; o < 8; o++) {
        var oa = fc * 3 + o * 45;
        fill(170, 225, 255, 170);
        ellipse(cos(oa) * 88, sin(oa) * 48, 3, 6);
    }
    // storm-cloud mane trailing off his back
    fill(34, 40, 66, 235);
    ellipse(-4, -22, 36, 22); ellipse(-22, -21, 32, 21); ellipse(-40, -16, 28, 18); ellipse(-54, -10, 20, 14); ellipse(12, -24, 26, 18);
    fill(60, 70, 106, 235);
    ellipse(-6, -27, 22, 11); ellipse(-25, -25, 18, 10); ellipse(-42, -20, 14, 8);
    if (fc % 24 < 4) {
        stroke(255, 250, 180); strokeWeight(1.6);
        line(-34, -24, -27, -17); line(-27, -17, -31, -11); line(-12, -26, -7, -19);
        noStroke();
        fill(255, 250, 200, 70); ellipse(-28, -18, 30, 20);
    }
    // big double tail with ribbed, glowing membranes
    fill(26, 84, 225, 225);
    beginShape();
    vertex(-36, 0); vertex(-86, -44 + w * 6); vertex(-72, -10); vertex(-96, 2 + w * 4); vertex(-72, 12); vertex(-84, 46 + w * 6);
    endShape(CLOSE);
    fill(120, 210, 255, 110);
    triangle(-40, -1, -78, -34 + w * 5, -62, -5); triangle(-40, 3, -76, 36 + w * 5, -62, 7);
    stroke(170, 240, 255, 150); strokeWeight(1);
    for (var r = 0; r < 4; r++) {
        line(-42, -1, -80 + r * 3, -38 + r * 9 + w * 5);
        line(-42, 3, -80 + r * 3, 40 - r * 9 + w * 5);
    }
    noStroke();
    fill(200, 250, 255, 220); ellipse(-86, -44 + w * 6, 6, 6); ellipse(-84, 46 + w * 6, 6, 6); ellipse(-96, 2 + w * 4, 5, 5);
    // the lightning crown (three bolts)
    fill(255, 240, 120, 55 + 40 * sin(fc * 10)); ellipse(3, -40, 54, 34);
    fill(255, 212, 36);
    beginShape();
    vertex(-22, -15); vertex(-13, -48); vertex(-8, -33); vertex(3, -60); vertex(8, -37); vertex(19, -55);
    vertex(18, -31); vertex(28, -42); vertex(24, -13);
    endShape(CLOSE);
    fill(255, 250, 190);
    triangle(-13, -43, -9, -32, -16, -22); triangle(3, -54, 6, -40, 0, -30); triangle(19, -50, 17, -34, 14, -28);
    // belly fins (ribbed)
    fill(50, 130, 255, 225); triangle(-12, 15, 6, 16, -10, 38 + w * 3);
    fill(50, 130, 255, 205); triangle(10, 14, 22, 14, 16, 29 - w * 2);
    stroke(160, 230, 255, 140); strokeWeight(0.8);
    line(-8, 17, -10, 34 + w * 3); line(-2, 17, -8, 33 + w * 3);
    noStroke();
    // armored body
    fill(8, 24, 78); ellipse(0, 0, 102, 47);
    fill(22, 60, 165); ellipse(3, -4, 92, 35);
    fill(38, 96, 212); ellipse(6, -9, 72, 17);
    fill(105, 195, 255); ellipse(8, 10, 68, 13);
    fill(170, 230, 255, 160); ellipse(10, 11, 46, 5);
    // armor scales
    stroke(8, 24, 78, 190); strokeWeight(1); noFill();
    for (var rr = 0; rr < 3; rr++) {
        for (var cc = 0; cc < 6; cc++) { arc(-32 + cc * 9 + (rr % 2) * 4.5, -11 + rr * 7, 9, 7, 0, 180); }
    }
    noStroke();
    // glowing lateral line
    for (var dd = 0; dd < 7; dd++) {
        fill(150, 245, 255, 140 + 110 * sin(fc * 6 + dd * 40));
        ellipse(-36 + dd * 9, 3, 3, 3);
    }
    // lightning stripes
    stroke(175, 250, 255, 235); strokeWeight(2);
    for (var i = 0; i < 3; i++) {
        var sx = -30 + i * 13;
        line(sx, -17, sx + 5, -9); line(sx + 5, -9, sx, -1); line(sx, -1, sx + 5, 7);
    }
    // gill slashes
    stroke(4, 12, 46); strokeWeight(1.6); noFill();
    arc(17, 0, 10, 26, -60, 60); arc(13, 0, 10, 24, -60, 60);
    noStroke();
    // head with an armored brow plate
    fill(18, 52, 146); ellipse(30, -1, 38, 34);
    fill(30, 76, 180); ellipse(28, -6, 26, 14);
    fill(10, 30, 92); quad(20, -17, 45, -12, 47, -8, 22, -10);
    fill(150, 220, 255, 160); ellipse(30, -14, 10, 2);
    // underbite jaw full of teeth
    fill(6, 12, 38); triangle(32, 4, 53, 2, 40, 16);
    fill(255);
    for (var tt = 0; tt < 4; tt++) { triangle(36 + tt * 4, 3.8 - tt * 0.3, 38.2 + tt * 4, 3.6 - tt * 0.3, 37 + tt * 4, 7.8); }
    triangle(37, 14, 39.5, 12.5, 39.5, 15.5); triangle(41.5, 12.8, 44, 11.3, 43.6, 14.3);
    // glowing eye with a light streak
    fill(120, 230, 255, 70); ellipse(34, -6, 24, 19);
    stroke(160, 240, 255, 130); strokeWeight(2); line(41, -7, 58, -11); noStroke();
    fill(255); ellipse(34, -6, 13, 13);
    fill(40, 220, 255); ellipse(35.5, -6, 8.5, 8.5);
    fill(0); ellipse(36.5, -6, 3, 5.5);
    fill(255, 255, 255, 235); ellipse(33, -8.5, 2.6, 2.6);
    // crackling electricity
    if (fc % 7 < 4) {
        stroke(225, 248, 255, 235); strokeWeight(1.5);
        var sa = (fc * 47) % 360;
        var ex = cos(sa) * 52; var ey = sin(sa) * 27;
        line(ex, ey, ex * 1.2 + 4, ey * 1.25 - 5);
        line(ex * 1.2 + 4, ey * 1.25 - 5, ex * 1.35 - 2, ey * 1.45 + 2);
        var sb = (fc * 83 + 120) % 360;
        var fx2 = cos(sb) * 50; var fy2 = sin(sb) * 26;
        line(fx2, fy2, fx2 * 1.25 - 3, fy2 * 1.2 + 4);
        noStroke();
    }
    popMatrix();
};
var drawRainGem = function(x, y, s) {
    pushMatrix(); translate(x, y); scale(s);
    noStroke();
    fill(120, 200, 255, 50); ellipse(0, 0, 26, 26);
    fill(40, 120, 230); ellipse(0, 3, 14, 14); triangle(-6.8, 1, 6.8, 1, 0, -12);
    fill(90, 175, 255); triangle(-6, 1, 0, -11, 0, 8); ellipse(-2, 4, 7, 7);
    fill(200, 240, 255); triangle(-3, -2, 0, -9, 0, 1);
    fill(255, 255, 255, 220); ellipse(-3, 2, 2.5, 3.5);
    popMatrix();
};
// 0 = raindrop, 1 = cloud, 2 = lightning bolt
var drawRainIcon = function(k, x, y, s) {
    noStroke();
    if (k === 0) {
        fill(80, 170, 255); ellipse(x, y + 2 * s, 8 * s, 8 * s); triangle(x - 3.9 * s, y + 0.5 * s, x + 3.9 * s, y + 0.5 * s, x, y - 6 * s);
    } else if (k === 1) {
        fill(200, 205, 220); ellipse(x - 3 * s, y + 1 * s, 7 * s, 6 * s); ellipse(x + 3 * s, y + 1 * s, 7 * s, 6 * s); ellipse(x, y - 1.5 * s, 7 * s, 7 * s);
    } else {
        fill(255, 215, 40);
        beginShape(); vertex(x + 1 * s, y - 6 * s); vertex(x - 3.5 * s, y + 1 * s); vertex(x, y + 1 * s); vertex(x - 1.5 * s, y + 6 * s);
        vertex(x + 3.5 * s, y - 1 * s); vertex(x, y - 1 * s); endShape(CLOSE);
    }
};
var drawRainAltar = function(x, y, a, water, gems) {
    if (water === undefined) { water = 1; }
    if (gems === undefined) { gems = 3; }
    noStroke();
    fill(80, 160, 255, a * 0.22 * water); ellipse(x, y - 52, 150, 130);
    fill(66, 74, 96, a); rect(x - 44, y - 12, 88, 12, 2);
    fill(88, 98, 124, a); rect(x - 28, y - 72, 56, 60, 3);
    fill(76, 86, 110, a); rect(x - 28, y - 72, 8, 60);
    fill(112, 122, 150, a); rect(x - 46, y - 86, 92, 15, 4);
    // the little bowl on top
    fill(58, 66, 88, a); arc(x, y - 86, 74, 28, 0, 180);
    fill(40, 46, 62, a); ellipse(x, y - 86, 64, 8);
    fill(90, 170, 255, a * 0.85 * water); ellipse(x, y - 86, 64 * water, 8 * water);
    // carved raindrops (glowing)
    var g = 0.6 + 0.4 * sin(frameCount * 4);
    for (var i = -1; i <= 1; i++) {
        var dx = x + i * 14; var dy = y - 42 + abs(i) * 6;
        if (i + 1 < gems) {
            fill(120, 210, 255, a * g * 0.5); ellipse(dx, dy, 18, 18);
            fill(60, 150, 245, a); ellipse(dx, dy + 3, 9, 9); triangle(dx - 4.4, dy + 1.5, dx + 4.4, dy + 1.5, dx, dy - 8);
            fill(200, 240, 255, a); ellipse(dx - 1.5, dy + 1, 2.5, 3.5);
        } else {
            fill(30, 34, 46, a); ellipse(dx, dy + 3, 8, 8); triangle(dx - 3.9, dy + 1.5, dx + 3.9, dy + 1.5, dx, dy - 7);
        }
    }
    // a little cloud carved on the slab
    fill(150, 160, 185, a);
    ellipse(x - 8, y - 79, 12, 7); ellipse(x, y - 81, 12, 8); ellipse(x + 8, y - 79, 12, 7);
};

// ============ TRES (the treasure blob from the Letter Vault chest) ============
var TRES_LEVEL = 97;
// a little sparkle star
var tresSparkle = function(x, y, sz, a) {
    noStroke(); fill(255, 250, 210, a);
    quad(x - sz, y, x, y - sz * 0.25, x + sz, y, x, y + sz * 0.25);
    quad(x, y - sz, x + sz * 0.25, y, x, y + sz, x - sz * 0.25, y);
};
var tresCoin = function(x, y, w) {
    noStroke();
    fill(180, 120, 20); ellipse(x, y + w * 0.08, w, w * 0.9);
    fill(250, 205, 70); ellipse(x, y, w, w * 0.9);
    fill(255, 235, 140); ellipse(x - w * 0.15, y - w * 0.15, w * 0.35, w * 0.25);
    noFill(); stroke(205, 150, 30); strokeWeight(max(0.5, w * 0.08)); ellipse(x, y, w * 0.62, w * 0.55); noStroke();
};
var tresGem = function(x, y, w, r, g, b) {
    noStroke();
    fill(r * 0.6, g * 0.6, b * 0.6); quad(x - w / 2, y, x, y - w * 0.6, x + w / 2, y, x, y + w * 0.6);
    fill(r, g, b); quad(x - w * 0.35, y, x, y - w * 0.45, x + w * 0.35, y, x, y + w * 0.45);
    fill(255, 255, 255, 190); triangle(x - w * 0.2, y - w * 0.05, x, y - w * 0.35, x - w * 0.05, y - w * 0.1);
};
// form 0: the little blob.  form 1: evolved (crown, armor, gem horns).  form 2: the giant boss
var drawTres = function(x, y, s, form) {
    pushMatrix(); translate(x, y); scale(s);
    noStroke();
    var wob = frameCount * 6;
    var i, a;
    if (form === 0) {
        fill(0, 0, 0, 50); ellipse(0, 24, 66, 12);
        fill(255, 220, 90, 40 + sin(frameCount * 5) * 20); ellipse(0, 0, 90, 74);
        // the gooey gold body
        fill(200, 140, 30);
        beginShape();
        for (a = 180; a <= 360; a += 20) { vertex(cos(a) * (32 + sin(wob + a * 3) * 2), 8 + sin(a) * (34 + sin(wob + a * 2) * 2)); }
        vertex(32, 22); vertex(18, 24); vertex(6, 30); vertex(-4, 24); vertex(-18, 27); vertex(-32, 22);
        endShape(CLOSE);
        fill(240, 190, 50);
        beginShape();
        for (a = 180; a <= 360; a += 20) { vertex(cos(a) * (29 + sin(wob + a * 3) * 2), 8 + sin(a) * (31 + sin(wob + a * 2) * 2)); }
        vertex(29, 18); vertex(-29, 18);
        endShape(CLOSE);
        fill(255, 228, 120); ellipse(-12, -12, 22, 14);
        fill(255, 250, 210); ellipse(-15, -15, 7, 4);
        // drips
        fill(240, 190, 50); ellipse(6, 30 + sin(wob) * 1.5, 6, 8); ellipse(-18, 27, 5, 6);
        // stuff stuck in it
        tresCoin(18, 6, 11); tresCoin(-20, 10, 9); tresCoin(4, 16, 8);
        tresGem(22, -10, 8, 230, 40, 70); tresGem(-24, -4, 7, 60, 200, 110);
        // gem eyes (they blink)
        var bl = (frameCount % 160) < 6 ? 0.15 : 1;
        fill(30, 40, 90); ellipse(-9, -2, 12, 14 * bl); ellipse(9, -2, 12, 14 * bl);
        if (bl > 0.5) {
            tresGem(-9, -2, 10, 80, 170, 255); tresGem(9, -2, 10, 80, 170, 255);
            fill(255); ellipse(-11, -6, 3, 3); ellipse(7, -6, 3, 3);
        }
        noFill(); stroke(130, 80, 10); strokeWeight(1.6); arc(0, 6, 12, 8, 10, 170); noStroke();
        fill(255, 150, 120, 120); ellipse(-17, 5, 7, 4); ellipse(17, 5, 7, 4);
        for (i = 0; i < 3; i++) { tresSparkle(cos(frameCount * 3 + i * 120) * 36, -10 + sin(frameCount * 3 + i * 120) * 22, 4 + sin(frameCount * 9 + i * 60) * 2, 220); }
    } else if (form === 1) {
        fill(0, 0, 0, 50); ellipse(0, 34, 80, 14);
        fill(255, 220, 90, 40 + sin(frameCount * 5) * 20); ellipse(0, 0, 130, 120);
        // a swirly tail of coins behind him
        for (i = 0; i < 7; i++) {
            var ta = frameCount * 2 + i * 22;
            tresCoin(-30 - i * 4 + sin(ta) * 3, 22 - i * 7 + cos(ta) * 2, 10 - i * 0.8);
        }
        // gem horns
        fill(70, 120, 230); triangle(-24, -26, -40, -54, -14, -32); triangle(24, -26, 40, -54, 14, -32);
        fill(150, 200, 255); triangle(-24, -28, -36, -50, -20, -31); triangle(24, -28, 36, -50, 20, -31);
        // body
        fill(190, 130, 25); ellipse(0, 6, 72, 66);
        fill(240, 190, 50); ellipse(0, 3, 66, 60);
        fill(255, 228, 120); ellipse(-14, -12, 22, 14);
        // little arms
        fill(220, 165, 40); ellipse(-36, 12, 16, 22); ellipse(36, 12, 16, 22);
        tresCoin(-38, 20, 9); tresCoin(38, 20, 9);
        // armor plates with studs
        fill(205, 150, 35); arc(0, 26, 56, 30, 180, 360);
        fill(255, 230, 140); for (i = 0; i < 5; i++) { ellipse(-20 + i * 10, 18 - abs(i - 2) * 1.5, 3, 3); }
        // the big ruby in his chest
        fill(255, 60, 90, 80 + sin(frameCount * 8) * 40); ellipse(0, 18, 24, 24);
        tresGem(0, 18, 14, 230, 30, 70);
        // glowing eyes + serious eyebrows
        fill(20, 30, 60); ellipse(-11, -4, 14, 12); ellipse(11, -4, 14, 12);
        fill(120, 230, 255); ellipse(-10, -4, 8, 8); ellipse(12, -4, 8, 8);
        fill(255); ellipse(-12, -6, 3, 3); ellipse(10, -6, 3, 3);
        fill(150, 95, 15); quad(-19, -13, -4, -9, -4, -7, -19, -10); quad(19, -13, 4, -9, 4, -7, 19, -10);
        noFill(); stroke(130, 80, 10); strokeWeight(2); arc(0, 8, 16, 8, 10, 170); noStroke();
        fill(255); triangle(-4, 11, -1, 11, -2.5, 14); triangle(1, 11, 4, 11, 2.5, 14);
        // the crown
        fill(200, 145, 30); rect(-20, -40, 40, 10, 2);
        fill(250, 205, 60); triangle(-20, -38, -14, -56, -8, -38); triangle(-8, -38, 0, -62, 8, -38); triangle(8, -38, 14, -56, 20, -38);
        fill(250, 205, 60); rect(-20, -40, 40, 8, 2);
        tresGem(0, -36, 7, 230, 40, 70); tresGem(-12, -36, 6, 60, 200, 110); tresGem(12, -36, 6, 70, 140, 255);
        fill(255, 255, 255); ellipse(0, -62, 4, 4); ellipse(-14, -56, 3, 3); ellipse(14, -56, 3, 3);
        for (i = 0; i < 5; i++) { tresSparkle(cos(frameCount * 2 + i * 72) * 54, sin(frameCount * 2 + i * 72) * 46, 4 + sin(frameCount * 9 + i * 60) * 2, 230); }
    } else {
        // ---- form 2: MEGA TRES ----
        fill(255, 210, 80, 30 + sin(frameCount * 4) * 15); ellipse(0, 10, 300, 230);
        // a fan of coin wings
        for (var wg = 0; wg < 2; wg++) {
            var side = wg === 0 ? -1 : 1;
            for (i = 0; i < 6; i++) {
                a = -70 + i * 22 + sin(frameCount * 3 + i * 20) * 4;
                for (var k = 3; k >= 0; k--) {
                    var rr = 58 + k * 17;
                    tresCoin(side * (30 + cos(a) * rr), -14 + sin(a) * rr * 0.9, 17 - k * 1.5);
                }
            }
        }
        // chain arms with coin fists
        stroke(200, 150, 40); strokeWeight(4); noFill();
        var sw = sin(frameCount * 5) * 8;
        bezier(-62, 10, -96, 20, -104, 54 + sw, -92, 78 + sw);
        bezier(62, 10, 96, 20, 104, 54 - sw, 92, 78 - sw);
        noStroke();
        for (i = 0; i < 6; i++) {
            fill(240, 200, 70);
            ellipse(-70 - i * 5, 16 + i * 10 + sw * i / 6, 7, 5); ellipse(70 + i * 5, 16 + i * 10 - sw * i / 6, 7, 5);
        }
        tresCoin(-92, 82 + sw, 24); tresCoin(92, 82 - sw, 24);
        // the huge body
        fill(170, 110, 20); ellipse(0, 18, 150, 134);
        fill(235, 180, 45); ellipse(0, 14, 142, 126);
        fill(255, 222, 110); ellipse(-34, -22, 46, 28);
        fill(255, 248, 210); ellipse(-40, -28, 14, 7);
        // coins + gems stuck all over him
        tresCoin(-56, 30, 14); tresCoin(54, 36, 13); tresCoin(-44, 58, 11); tresCoin(46, 60, 12); tresCoin(60, 0, 10);
        tresGem(-58, 6, 12, 60, 200, 110); tresGem(52, 16, 11, 170, 80, 230); tresGem(30, 66, 10, 70, 140, 255);
        // necklaces of pearls
        noFill(); stroke(250, 250, 240); strokeWeight(3);
        arc(0, 6, 120, 70, 20, 160); stroke(240, 200, 220); arc(0, 14, 110, 70, 25, 155);
        noStroke();
        // the belly window (the eaten cast gets drawn in here by the ending)
        fill(120, 70, 10); ellipse(0, 46, 82, 64);
        fill(150, 95, 20); ellipse(0, 46, 74, 56);
        // the treasure-chest MOUTH
        var jaw = 6 + abs(sin(frameCount * 4)) * 8;
        fill(110, 60, 20); rect(-34, -2, 68, 10 + jaw, 3);
        fill(40, 10, 10); rect(-30, 2, 60, jaw + 4, 2);
        fill(250, 235, 180);
        for (i = 0; i < 7; i++) { triangle(-28 + i * 8.5, 2, -22 + i * 8.5, 2, -25 + i * 8.5, 8); triangle(-28 + i * 8.5, jaw + 6, -22 + i * 8.5, jaw + 6, -25 + i * 8.5, jaw); }
        fill(200, 150, 40); rect(-36, -6, 72, 6, 2); rect(-36, jaw + 6, 72, 5, 2);
        fill(255, 230, 140); for (i = 0; i < 6; i++) { ellipse(-30 + i * 12, -3, 3, 3); }
        fill(90, 60, 20); rect(-5, -8, 10, 9, 2); fill(250, 205, 60); ellipse(0, -4, 4, 4);
        // FOUR gem eyes
        fill(20, 10, 30); ellipse(-26, -30, 26, 22); ellipse(26, -30, 26, 22);
        fill(255, 40, 70); ellipse(-25, -30, 16, 16); ellipse(27, -30, 16, 16);
        fill(255, 220, 230); ellipse(-28, -33, 5, 5); ellipse(24, -33, 5, 5);
        tresGem(-46, -16, 10, 80, 170, 255); tresGem(46, -16, 10, 80, 170, 255);
        fill(150, 90, 10); quad(-40, -46, -12, -38, -12, -35, -40, -41); quad(40, -46, 12, -38, 12, -35, 40, -41);
        // the GIANT crown
        fill(190, 130, 25); rect(-50, -76, 100, 22, 3);
        fill(250, 205, 60);
        triangle(-50, -72, -40, -112, -28, -72); triangle(-28, -72, -14, -124, 0, -72);
        triangle(0, -72, 14, -124, 28, -72); triangle(28, -72, 40, -112, 50, -72);
        rect(-50, -76, 100, 18, 3);
        fill(255, 240, 160); rect(-50, -76, 100, 4, 3);
        tresGem(-34, -66, 12, 230, 40, 70); tresGem(-12, -66, 12, 60, 200, 110); tresGem(12, -66, 12, 70, 140, 255); tresGem(34, -66, 12, 170, 80, 230);
        fill(255); ellipse(-40, -112, 6, 6); ellipse(-14, -124, 7, 7); ellipse(14, -124, 7, 7); ellipse(40, -112, 6, 6);
        for (i = 0; i < 8; i++) { tresSparkle(cos(frameCount * 2 + i * 45) * 110, 10 + sin(frameCount * 2 + i * 45) * 90, 5 + sin(frameCount * 9 + i * 60) * 2.5, 230); }
    }
    popMatrix();
};
// the 5 treasure symbols: 0 coin, 1 gem, 2 crown, 3 cup, 4 ring
// GIGA-TRES: Mega Tres + horns, a gold-bar crown of spikes, a purple cape and a halo of coins
var drawFoolCoin = function(x, y, w) {
    noStroke();
    fill(110, 105, 60); ellipse(x, y + w * 0.08, w, w * 0.9);
    fill(170, 165, 95); ellipse(x, y, w, w * 0.9);
    fill(195, 190, 120); ellipse(x - w * 0.15, y - w * 0.15, w * 0.3, w * 0.2);
    stroke(80, 75, 40); strokeWeight(max(0.6, w * 0.07));
    line(x - w * 0.3, y - w * 0.1, x, y + w * 0.05); line(x, y + w * 0.05, x + w * 0.1, y + w * 0.3); line(x, y + w * 0.05, x + w * 0.3, y - w * 0.15);
    noStroke();
    fill(100, 140, 60, 160); ellipse(x + w * 0.2, y + w * 0.15, w * 0.18, w * 0.14); ellipse(x - w * 0.22, y + w * 0.2, w * 0.14, w * 0.1);
};
var drawGigaTres = function(x, y, s) {
    pushMatrix(); translate(x, y); scale(s);
    noStroke();
    var i;
    fill(170, 60, 220, 30 + sin(frameCount * 4) * 15); ellipse(0, 0, 380, 300);
    // the purple cape
    fill(70, 20, 90); quad(-70, -10, 70, -10, 120, 150, -120, 150);
    fill(100, 30, 130); quad(-60, -10, 60, -10, 100, 140, -100, 140);
    fill(250, 205, 60); for (i = 0; i < 9; i++) { ellipse(-100 + i * 25, 144 + (i % 2) * 3, 6, 6); }
    // gold bars sticking out of his back like spikes
    for (i = 0; i < 7; i++) {
        var a = -165 + i * 25;
        pushMatrix(); rotate(a + 90);
        fill(170, 115, 20); rect(-9, -150 - (i % 2) * 20, 18, 80, 2);
        fill(245, 195, 60); rect(-7, -148 - (i % 2) * 20, 14, 76, 2);
        fill(255, 235, 150); rect(-7, -148 - (i % 2) * 20, 4, 76, 1);
        popMatrix();
    }
    popMatrix();
    // a halo of coins spinning around him
    for (i = 0; i < 14; i++) {
        var ha = frameCount * 1.5 + i * (360 / 14);
        tresCoin(x + cos(ha) * 165 * s, y - 20 * s + sin(ha) * 120 * s, 12 * s);
    }
    drawTres(x, y, s, 2);
    pushMatrix(); translate(x, y); scale(s);
    noStroke();
    // a purple shine all over
    fill(150, 40, 200, 35); ellipse(0, 14, 142, 126);
    // giant curly horns
    fill(120, 80, 20);
    triangle(-46, -70, -30, -78, -110, -150); triangle(46, -70, 30, -78, 110, -150);
    fill(230, 180, 50);
    triangle(-44, -72, -34, -77, -100, -140); triangle(44, -72, 34, -77, 100, -140);
    tresGem(-110, -150, 12, 180, 70, 240); tresGem(110, -150, 12, 180, 70, 240);
    // spiky shoulder armor
    for (var sd = -1; sd <= 1; sd += 2) {
        fill(140, 90, 20); ellipse(sd * 68, -4, 44, 34);
        fill(220, 165, 45); ellipse(sd * 68, -7, 38, 26);
        fill(250, 215, 100); triangle(sd * 56, -18, sd * 64, -18, sd * 62, -40); triangle(sd * 70, -18, sd * 78, -16, sd * 82, -38);
        tresGem(sd * 68, -6, 10, 180, 70, 240);
    }
    // two more eyes (purple ones)
    fill(20, 10, 30); ellipse(-50, -48, 16, 13); ellipse(50, -48, 16, 13);
    fill(200, 80, 255); ellipse(-50, -48, 10, 10); ellipse(50, -48, 10, 10);
    fill(255); ellipse(-52, -50, 3, 3); ellipse(48, -50, 3, 3);
    // the GIGA gem on top of the crown
    fill(200, 100, 255, 90 + sin(frameCount * 8) * 50); ellipse(0, -140, 40, 40);
    tresGem(0, -140, 26, 180, 70, 240);
    popMatrix();
};
var TRES_SYM_NAMES = ["COIN", "GEM", "CROWN", "CUP", "RING", "SWORD"];
var drawTresSym = function(k, x, y, s) {
    pushMatrix(); translate(x, y); scale(s);
    noStroke();
    if (k === 0) { tresCoin(0, 0, 18); }
    else if (k === 1) { tresGem(0, 0, 18, 60, 200, 110); }
    else if (k === 2) {
        fill(250, 205, 60); rect(-9, -1, 18, 7, 1);
        triangle(-9, 0, -6, -9, -3, 0); triangle(-3, 0, 0, -11, 3, 0); triangle(3, 0, 6, -9, 9, 0);
        fill(230, 40, 70); ellipse(0, 2.5, 4, 4);
    } else if (k === 3) {
        fill(230, 180, 50); arc(0, -6, 18, 18, 0, 180); rect(-1.5, 2, 3, 6); rect(-6, 7, 12, 3, 1);
        fill(255, 230, 140); rect(-9, -7, 18, 2);
    } else if (k === 4) {
        noFill(); stroke(240, 195, 60); strokeWeight(3.5); ellipse(0, 2, 15, 15); noStroke();
        tresGem(0, -6, 8, 80, 170, 255);
    } else {
        fill(210, 215, 230); quad(-1.5, -12, 1.5, -12, 1.5, 4, -1.5, 4); triangle(-1.5, -12, 1.5, -12, 0, -16);
        fill(240, 195, 60); rect(-7, 4, 14, 3, 1); rect(-1.5, 7, 3, 6, 1); ellipse(0, 14, 4, 4);
    }
    popMatrix();
};
// the treasure altar. st = l9Tres
var drawTresAltar = function(x, y, st) {
    noStroke();
    // the steps
    fill(150, 105, 30); rect(x - 66, y - 14, 132, 14, 2);
    fill(175, 125, 40); rect(x - 56, y - 26, 112, 14, 2);
    fill(200, 150, 50); rect(x - 66, y - 14, 132, 3); rect(x - 56, y - 26, 112, 3);
    // the pedestal
    fill(190, 140, 40); rect(x - 42, y - 84, 84, 60, 3);
    fill(220, 170, 60); rect(x - 42, y - 84, 84, 5, 3);
    fill(160, 110, 30); rect(x - 46, y - 92, 92, 10, 3);
    // the ring lock on its front (5 rings)
    fill(120, 80, 20); rect(x - 42, y - 70, 84, 26, 4);
    for (var r = 0; r < 6; r++) {
        var rx = x - 35 + r * 14;
        fill(70, 45, 15); ellipse(rx, y - 57, 12, 12);
        if (st.ring) { fill(255, 230, 120, 120 + sin(frameCount * 6 + r * 30) * 80); ellipse(rx, y - 57, 12, 12); }
        if (st.rk && st.rk.length > r) { drawTresSym(st.rk[r], rx, y - 56, 0.5); }
    }
    // the bowl on top
    fill(150, 100, 25); arc(x, y - 96, 76, 44, 0, 180);
    fill(220, 170, 55); arc(x, y - 98, 76, 40, 0, 180);
    fill(90, 55, 15); ellipse(x, y - 98, 70, 12);
    if (!st.ring) {
        // a lid on the bowl until the lock is opened
        fill(200, 150, 45); arc(x, y - 98, 74, 28, 180, 360);
        fill(240, 200, 90); ellipse(x, y - 110, 10, 7);
    } else if (st.hoard === 2) {
        // full of the perfect hoard
        for (var c = 0; c < 9; c++) { tresCoin(x - 26 + (c % 5) * 13, y - 100 - floor(c / 5) * 5, 11); }
    }
    // the crystal on its stand
    fill(160, 110, 30); rect(x + 46, y - 150, 6, 64, 2);
    fill(200, 150, 45); quad(x + 38, y - 150, x + 60, y - 150, x + 56, y - 144, x + 42, y - 144);
    if (st.lit) {
        fill(255, 240, 150, 70 + sin(frameCount * 8) * 40); ellipse(x + 49, y - 164, 40, 40);
        fill(255, 245, 190); quad(x + 49, y - 182, x + 58, y - 164, x + 49, y - 150, x + 40, y - 164);
        fill(255, 255, 255); quad(x + 49, y - 178, x + 53, y - 166, x + 49, y - 158, x + 45, y - 166);
    } else {
        fill(110, 110, 125); quad(x + 49, y - 182, x + 58, y - 164, x + 49, y - 150, x + 40, y - 164);
        fill(150, 150, 165); quad(x + 49, y - 178, x + 53, y - 166, x + 49, y - 158, x + 45, y - 166);
    }
    // carvings
    fill(150, 100, 25); textSize(6); textAlign(CENTER); text("FOR THE ONE MADE OF TREASURE", x, y - 32);
    // DUST (thick at first)
    if (st.dust > 0) {
        var da = st.dust * 2.3;
        fill(130, 125, 115, da); rect(x - 66, y - 186, 132, 186, 6);
        fill(160, 155, 145, da * 0.8);
        for (var d = 0; d < 14; d++) { ellipse(x - 56 + (d * 37) % 112, y - 170 + (d * 53) % 160, 22, 14); }
        stroke(110, 105, 95, da); strokeWeight(0.7);
        line(x - 66, y - 186, x - 40, y - 150); line(x + 66, y - 186, x + 44, y - 160); line(x - 66, y - 186, x - 30, y - 186 + 6);
        noStroke();
    }
};

var TW5_DATA = [[[5,4,2,3,1,2,1,3,5,4,4,5,1,2,3,1,3,5,4,2,3,2,4,1,5],[0,0,0,0,0,0,3,0,3,0,0,3,0,3,3,4,0,2,0,0]],[[4,3,2,1,5,1,2,4,5,3,5,1,3,4,2,3,4,5,2,1,2,5,1,3,4],[2,3,3,2,0,0,1,0,3,2,0,4,0,3,0,0,0,0,0,0]],[[3,4,1,5,2,1,2,3,4,5,5,3,4,2,1,4,5,2,1,3,2,1,5,3,4],[0,0,0,0,0,3,0,0,3,0,3,5,0,0,0,0,0,4,0,0]],[[5,4,3,2,1,1,2,4,3,5,4,5,2,1,3,3,1,5,4,2,2,3,1,5,4],[0,0,0,0,0,4,0,0,1,2,0,4,0,0,0,5,0,0,0,0]],[[2,1,4,5,3,3,4,5,1,2,5,2,1,3,4,1,3,2,4,5,4,5,3,2,1],[3,3,2,0,3,2,0,0,0,0,3,0,0,0,0,0,0,0,0,4]],[[1,5,2,3,4,3,2,1,4,5,4,1,3,5,2,2,4,5,1,3,5,3,4,2,1],[4,0,3,3,0,0,0,2,2,3,2,0,2,0,0,0,0,2,0,0]]];
var RA_AKARI = [[[7,13,15,22,26,28,36,37,40,42,47],[7,2,26,0,36,3,40,1,15,2,28,3],[0,8,16,21,24,29,35,39,43,48]],[[2,9,12,15,17,21,25,36,38,42,47],[42,2,38,2,9,1,25,1,47,2,15,1],[1,5,7,10,18,22,31,35,37,40,43,48]],[[0,6,8,11,15,19,25,29,37,41,45],[19,2,37,3,41,1,25,1,8,2,45,1],[1,7,10,12,18,22,27,30,36,39,44,48]],[[0,1,6,8,13,14,17,32,35,37,42],[37,1,14,3,32,3,17,2],[2,7,10,15,18,21,31,33,39,44]],[[1,3,19,21,22,30,35,36,37,40,47],[37,1,30,1,1,2,19,2,35,2],[0,5,8,18,20,23,28,33,38,42]],[[4,6,8,10,27,28,33,35,37,39,41],[39,3,10,2,37,1,8,2,4,3],[3,5,7,11,15,23,34,38,40,46]]];
var RA_DOMINO = [[[2,2,1,2,3,2,3,2,3,1,0,0,0,3,1,0,1,3,1,0],[0,5,1,2,3,4,6,11,7,12,8,13,9,14,10,15,16,17,18,19]],[[0,2,2,3,1,3,0,0,0,1,2,1,3,3,2,0,3,2,1,1],[0,5,1,2,3,4,6,11,7,8,9,14,10,15,12,13,16,17,18,19]],[[2,0,1,3,0,2,3,1,1,1,2,3,2,0,0,0,2,3,3,1],[0,5,1,2,3,4,6,11,7,12,8,9,10,15,13,14,16,17,18,19]],[[3,0,0,0,1,2,2,3,1,0,3,1,0,2,2,1,1,2,3,3],[0,1,2,3,4,9,5,10,6,11,7,8,12,17,13,14,15,16,18,19]],[[0,1,0,3,1,0,3,2,3,3,2,3,1,1,0,0,2,2,1,2],[0,5,1,2,3,4,6,11,7,8,9,14,10,15,12,13,16,17,18,19]],[[0,2,2,3,1,0,0,3,1,3,1,1,1,2,0,3,3,2,2,0],[0,1,2,3,4,9,5,10,6,7,8,13,11,12,14,19,15,16,17,18]]];
var GA_PATH = [[[24,23,22,21,20,15,16,17,18,19,14,9,4,3,8,13,12,11,10,5,0,1,6,7,2],[25,2,24,7,8,17,6,15]],[[20,15,10,5,0,1,2,3,4,9,14,19,24,23,22,21,16,17,18,13,8,7,6,11,12],[23,6,4,5,9,4,21,8]],[[20,15,10,5,0,1,6,11,16,21,22,17,12,7,2,3,4,9,8,13,14,19,18,23,24],[14,7,12,17,8,11,25,24]],[[22,23,24,19,18,17,16,21,20,15,10,5,0,1,2,3,4,9,14,13,8,7,6,11,12],[25,12,18,9,5,18,3,24]],[[2,1,0,5,10,15,20,21,16,11,6,7,12,17,22,23,24,19,18,13,14,9,4,3,8],[25,8,11,6,2,1,20,13]],[[8,9,4,3,2,1,0,5,6,7,12,11,10,15,20,21,16,17,22,23,24,19,14,13,18],[1,8,10,7,24,13,17,16,23,14]]];
var VT_KY = [[[1,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,0,1,0,1,0,1,0,1,1,0],[4,1,9,0,34,1,2,1,22,1,18,0,12,0]],[[0,1,0,1,1,0,0,0,1,1,0,1,1,1,0,0,1,0,0,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,0],[14,0,3,1,9,1,0,0,34,1,19,1,4,1,23,1,26,1]],[[1,1,0,0,1,0,1,0,0,1,1,0,0,1,1,0,0,1,0,1,1,0,1,0,1,0,0,1,0,1,0,0,1,1,0,1],[33,1,7,0,2,0,29,1,27,1,24,1,9,1]],[[0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,1,0,0,1,0,1,1,0,0,1,1,0,0,1,1,0,1,0,1,0],[25,1,16,1,4,0,18,0,15,1,26,1,22,1]],[[0,1,1,0,0,1,0,1,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,0,0,1,0,1,0,1,1,0,0,1,1,0],[26,0,17,1,24,0,19,0,10,1,9,0,31,0,28,0,32,0]],[[0,1,1,0,0,1,0,0,1,1,0,1,1,0,0,1,1,0,0,1,0,0,1,1,1,0,1,1,0,0,1,1,0,0,1,0],[11,1,23,1,30,1,14,0,4,0,21,0,13,0,31,1,3,0]]];
var VT_ABC = [[[4,3,5,2,1,2,5,1,4,3,1,4,3,5,2,3,2,4,1,5,5,1,2,3,4],[],[24,19,14,9,3,2,23,24,1,0,11,6,16,15,12,17,21,16,7,12]],[[5,2,3,4,1,3,4,1,5,2,2,3,4,1,5,4,1,5,2,3,1,5,2,3,4],[14,5],[18,17,18,19,13,18,11,6,10,11,23,24,22,17,20,15]],[[5,1,2,3,4,1,5,3,4,2,2,4,5,1,3,3,2,4,5,1,4,3,1,2,5],[24,5],[15,20,1,2,17,18,2,3,16,15,13,8,3,4]],[[5,4,1,3,2,3,5,2,4,1,4,2,3,1,5,2,1,4,5,3,1,3,5,2,4],[19,3],[16,15,3,8,1,0,9,4,15,10,4,3,17,22]],[[2,3,1,4,5,4,5,3,2,1,5,1,4,3,2,1,4,2,5,3,3,2,5,1,4],[20,3,14,2,22,5,7,3,9,1,13,3,4,5,18,5,17,2],[0,5,11,16]],[[5,1,2,3,4,1,3,4,2,5,3,4,5,1,2,2,5,1,4,3,4,2,3,5,1],[18,4,7,4,15,2,17,1,5,1,11,4,2,2],[4,9,2,3,11,12,24,19,8,7]]];
var VT_LADDERS = [["OWL","NOT"],["MAP","PIE"],["GEM","YAP"],["SUN","PRY"],["CUP","RYE"],["DOG","SKY"],["HAT","OIL"]];
var VT_WORDS = "ACE ACT ADD ADO AGE AGO AID AIM AIR ALE ALL AND ANT ANY APE APT ARC ARE ARK ARM ART ASH ASK ATE AWE AXE BAD BAG BAN BAR BAT BAY BED BEE BEG BET BID BIG BIN BIT BOA BOB BOG BOO BOW BOX BOY BUD BUG BUN BUS BUT BUY BYE CAB CAN CAP CAR CAT COD COG CON COP COT COW COY CRY CUB CUD CUE CUP CUR CUT DAB DAD DAM DAY DEN DEW DID DIE DIG DIM DIN DIP DOE DOG DON DOT DRY DUB DUD DUE DUG DYE EAR EAT EBB EEL EGG EGO ELF ELK ELM END ERA EVE EWE EYE FAB FAD FAN FAR FAT FAX FED FEE FEN FEW FIB FIG FIN FIR FIT FIX FLU FLY FOE FOG FOR FOX FRY FUN FUR GAB GAG GAL GAP GAS GEL GEM GET GIG GIN GNU GOD GOT GUM GUN GUT GUY GYM HAD HAG HAM HAS HAT HAY HEM HEN HER HEW HEY HID HIM HIP HIS HIT HOB HOD HOG HOP HOT HOW HUB HUE HUG HUM HUT ICE ICY ILL IMP INK INN ION IRE IRK ITS IVY JAB JAG JAM JAR JAW JAY JET JIG JOB JOG JOT JOY JUG JUT KEG KEN KEY KID KIN KIT LAB LAD LAG LAP LAW LAX LAY LEA LED LEG LET LID LIE LIP LIT LOB LOG LOT LOW LUG MAD MAN MAP MAR MAT MAW MAY MEN MET MID MIX MOB MOD MOM MOP MUD MUG MUM NAB NAG NAP NET NEW NIB NIL NIP NIT NOD NOR NOT NOW NUN NUT OAK OAR OAT ODD ODE OFF OFT OHM OIL OLD ONE OPT ORB ORE OUR OUT OWE OWL OWN PAD PAL PAN PAR PAT PAW PAY PEA PEG PEN PEP PER PET PEW PIE PIG PIN PIT PLY POD POP POT POW PRY PUB PUG PUN PUP PUS PUT RAG RAM RAN RAP RAT RAW RAY RED RIB RID RIG RIM RIP ROB ROD ROE ROT ROW RUB RUG RUM RUN RUT RYE SAD SAG SAP SAT SAW SAY SEA SEE SET SEW SHY SIN SIP SIR SIS SIT SIX SKI SKY SLY SOB SOD SON SOW SOY SPA SPY SUB SUE SUM SUN SUP TAB TAG TAN TAP TAR TAX TEA TEE TEN THE TIE TIN TIP TOE TON TOO TOP TOT TOW TOY TRY TUB TUG TWO URN USE VAN VAT VET VEX VIA VIE VOW WAD WAG WAR WAS WAX WAY WEB WED WEE WET WHO WHY WIG WIN WIT WOE WOK WON WOO WOW YAK YAM YAP YAW YEA YES YET YEW YOU ZAP ZED ZEN ZIP ZIT ZOO";
var GA_MATCH = [[1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,0,0,0,0],[1,1,0,1,1,0,1,1,0,1,1,0,0,1,1,1,1,1,0,0,0,0],[1,1,0,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,0],[1,0,1,1,0,1,1,1,0,1,1,0,0,1,1,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,1],[0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,1,0,1,1,1,1,1],[1,1,0,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,0,0,0,0],[1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1],[1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0]];
// ============ LEVEL 9 - THE END (for real) ============
var l9Scene = 0;     // 0 the end card + credits, 1 backstage, 2 curtain call
var l9T = 0;
var l9Scroll = 0;
var l9Inv = [];      // item names you're carrying
var l9Taken = {};
var l9Held = {type: "", x: 0, y: 0};
var l9Powered = 0;   // flashlight has batteries
var l9Door = {locked: 1, open: 0, rattle: 0};
var l9Exit = {batteries: 1};
var l9Lit = 0;
var l9LampX = 200;
var l9Rex = {x: 232, y: 318, state: "asleep", t: 0, face: 1};
var l9Duck = {x: 0, on: 0};
var l9Lever = {ang: -40, held: 0};
var l9Fuse = {open: 0, inBox: 0, found: 0};
var l9Letters = [];
var l9Power = 0;     // stage power (after the fuse goes in)
var l9Says = {txt: "", x: 0, y: 0, t: 0};
var l9Promise = 0;
var l9Bows = [];
var l9Keypad = {open: 0, entry: "", msg: "", msgT: 0};
var L9_CODE = "312";
var l9Squeak = {t: -1, x: 0, y: 0, onStage: 0};
var l9Bubbles = [];
var l9Press = {x: 0, y: 0, slot: -1};
var l9StageOpen = 0;
var l9CurtainT = 0;
var l9Costume = {taken: 0};
var l9Plush = {taken: 0};
var l9Marks = [];
var l9RexStage = {on: 0, x: -40, mark: -1};
var l9Clip = 0;
var l9Rope = {y: 0, held: 0, x: 0};
var l9Cough = 0;
var l9Vend = {};
var l9Fox = {};
var l9Bird = {};
var l9Seed = {on: 0, x: 0, y: 0};
var l9Celery = {on: 0, x: 0, y: 0};
var l9Vault = {door: 0, room: 0, t: 0, solved: 0, msg: "", shift: 0, pass: "", wheel: 0, dial: [], pic: 0, grid: [], tiles: [], moves: 0};
var l9Encore = {clicks: 0, stage: 0, t: 0, seq: 0, dial: [0, 0, 0], open: 0};
var l9Tres = {got: 0, chest: 0, chestT: 0, back: 0, backT: 0, gen: 0, dPile: 0, pile: [0, 0, 0], dust: 100, ring: 0, rk: [0, 0, 0, 0, 0], ans: [], clues: [], towers: 0, tw: [], tSol: [], tClue: [], bm: {cells: [], r0: 0, ex: 0, pts: [], ok: 0, hit: 0}, lit: 0, hoard: 0, evo: 0, evoT: 0, onStage: 0, sx: 200, sy: 240, panel: "", lastX: 0, lastY: 0};
var l9Rain = {door: 0, guppy: 0, met: 0, hole: 0, lit: 0, altarA: 0, storm: 0, fish: 0, fishOn: 0, fishX: 200, fishY: 250, hanger: 0, ladder: 0, bulb: 0, box: 0, spare: 0, sky: 0, altarX: 118, altarHeld: 0, fill: 0, dryTold: 0, gems: 0, puddleGem: 0, sun: 0, combo: [0, 0, 0], lock: [0, 0, 0], trunk: 0, drainTold: 0};
var l9Beast = {state: "under", t: 0};
var L9_TRAP_X = 222;
var L9_TRAP_Y = 255;
var l9Snacks = [];
var L9_VEND_X = 108;
var L9_VEND_Y = 250;
var L9_OUTLET_X = 62;
var L9_OUTLET_Y = 206;
var L9_VCODE = ["D4", "C3", "B2", "A1"];
var L9_DOOR_X = 352;
var L9_DOOR_Y = 300;
var L9_LEVER_X = 232;
var L9_LEVER_Y = 316;
var l9Credits = [
    ["A GAME BY", "Toadjames", ""],
    ["", "", ""],
    ["THE WEREWOLF", "himself", ""],
    ["THE PURPLE MONSTER", "a big eater", ""],
    ["THE FOX", "(we're sorry)", ""],
    ["THE BIRD", "up in the rafters", ""],
    ["SEVEN CAVE CRITTERS", "in a pot", ""],
    ["THE ALTAR BEAST", "(on a diet now)", "bone"],
    ["KEY GRIP", "Gary", "key"],
    ["THE STUCK PIXEL", "still stuck", ""],
    ["GAFFER", "Linda", "flashlight"],
    ["BATTERIES", "not included", "nobatteries"],
    ["THE RUBBER DUCK", "squeak", "duck"],
    ["DOOR CODE", "ask the duck", ""],
    ["ELECTRICIAN", "blew a fuse", ""],
    ["THE VENDING MACHINE", "on break", ""],
    ["BUDGET", "25 cents", "coin"],
    ["TECHNICIAN", "D4 C3 B2 A1", ""],
    ["BEST BOY", "Rex (very good boy)", ""],
    ["CATERING", "1 veggie sandwich", "sandwich"],
    ["SNACKS EATEN", "58,058", ""],
    ["SPECIAL THANKS", "the rain", "gem"],
    ["", "", ""],
    ["NO WEREWOLVES WERE HARMED", "", ""],
    ["(one was fed a LOT)", "", ""],
    ["", "", ""],
    ["THANKS FOR PLAYING", "", ""]
];
var L9_CREDIT_LH = 24;
var L9_WIN_TOP = 128;
var L9_WIN_BOT = 352;

var initLevel9 = function() {
    l9Scene = 0; l9T = 0; l9Scroll = 0;
    l9Inv = []; l9Taken = {};
    l9Held = {type: "", x: 0, y: 0};
    l9Powered = 0;
    l9Door = {locked: 1, open: 0, rattle: 0};
    l9Exit = {batteries: 1};
    l9Lit = 0; l9LampX = 200;
    l9Rex = {x: 232, y: 318, state: "asleep", t: 0, face: 1};
    l9Duck = {x: 0, on: 0};
    l9Lever = {ang: -40, held: 0};
    l9Fuse = {open: 0, inBox: 0, found: 0};
    l9Letters = [
        {ch: "E", x: 314, y: 270, vx: 0, vy: 0, out: 0, rot: 0},
        {ch: "N", x: 338, y: 266, vx: 0, vy: 0, out: 0, rot: 0},
        {ch: "D", x: 362, y: 271, vx: 0, vy: 0, out: 0, rot: 0}
    ];
    l9Power = 0;
    l9Says = {txt: "", x: 0, y: 0, t: 0};
    l9Promise = 0;
    l9Bows = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    l9Keypad = {open: 0, entry: "", msg: "", msgT: 0};
    l9Squeak = {t: -1, x: 0, y: 0, onStage: 0};
    l9Bubbles = [];
    l9Press = {x: 0, y: 0, slot: -1};
    l9StageOpen = 0; l9CurtainT = 0;
    l9Costume = {taken: 0}; l9Plush = {taken: 0};
    l9Marks = [{x: 125, y: 306, item: ""}, {x: 190, y: 306, item: ""}, {x: 255, y: 306, item: ""}, {x: 320, y: 306, item: ""},
               {x: 157, y: 268, item: ""}, {x: 222, y: 268, item: ""}, {x: 287, y: 268, item: ""}];
    l9RexStage = {on: 0, x: -40, mark: -1};
    l9Clip = 0; l9Rope = {y: 0, held: 0, x: 0}; l9Cough = 0;
    l9Vend = {plugged: 0, plugX: 152, plugY: 262, plugHeld: 0, credit: 0, keypad: 0, entry: "", seq: [], msg: "ON BREAK",
              vslot: "", vt: 0, dumped: 0, dumpT: 0, hop: 0, hopT: 0, x: L9_VEND_X, y: L9_VEND_Y};
    l9Fox = {state: "hiding", t: 0};
    l9Bird = {state: "rafters", x: 150, y: 34, tx: 0, ty: 0, t: 0, mark: -1};
    l9Seed = {on: 0, x: 0, y: 0};
    l9Celery = {on: 0, x: 0, y: 0};
    l9Rain = {door: 0, guppy: 0, met: 0, hole: 0, lit: 0, altarA: 0, storm: 0, fish: 0, fishOn: 0, fishX: 200, fishY: 250, hanger: 0, ladder: 0, bulb: 0, box: 0, spare: 0, sky: 0, altarX: 118, altarHeld: 0, fill: 0, dryTold: 0, gems: 0, puddleGem: 0, sun: 0, combo: [0, 0, 0], lock: [0, 0, 0], trunk: 0, drainTold: 0};
    l9Encore = {clicks: 0, stage: 0, t: 0, seq: 0, dial: [0, 0, 0], open: 0};
    l9Vault = {door: 0, room: 0, t: 0, solved: 0, msg: "", shift: 0, pass: "", wheel: 0, dial: [], pic: 0, grid: [], tiles: [], moves: 0};
    l9Tres = {got: 0, chest: 0, chestT: 0, back: 0, backT: 0, gen: 0, dPile: 0, pile: [0, 0, 0], dust: 100, ring: 0, rk: [0, 0, 0, 0, 0], ans: [], clues: [], towers: 0, tw: [], tSol: [], tClue: [], bm: {cells: [], r0: 0, ex: 0, pts: [], ok: 0, hit: 0}, lit: 0, hoard: 0, evo: 0, evoT: 0, onStage: 0, sx: 200, sy: 240, panel: "", lastX: 0, lastY: 0};
    if (l4KeyGot) { l9Inv.push("wordkey"); }
    l9Rain.combo = [floor(random(0, 3)), floor(random(0, 3)), floor(random(0, 3))];
    if (l9Rain.combo[0] === 0 && l9Rain.combo[1] === 0 && l9Rain.combo[2] === 0) { l9Rain.combo[1] = 2; }
    if (srHasRainKey) { l9Inv.push("rainkey"); }
    l9Beast = {state: "under", t: 0};
    l9Snacks = [];
};
initLevel9();

var l9Say = function(txt, x, y) { l9Says = {txt: txt, x: constrain(x, 70, 330), y: y, t: 110}; };
var l9HasItem = function(type) {
    for (var i = 0; i < l9Inv.length; i++) { if (l9Inv[i] === type) { return true; } }
    return false;
};
var l9RemoveItem = function(type) {
    for (var i = 0; i < l9Inv.length; i++) { if (l9Inv[i] === type) { l9Inv.splice(i, 1); return; } }
};
var l9SlotX = function(i) { return 40 + i * 44; };
var L9_SLOT_Y = 377;
var l9LettersOut = function() {
    var n = 0;
    for (var i = 0; i < l9Letters.length; i++) { n += l9Letters[i].out; }
    return n;
};
var l9RexBlocking = function() { return abs(l9Rex.x - L9_LEVER_X) < 55; };
var l9MarkWith = function(item) {
    for (var i = 0; i < l9Marks.length; i++) { if (l9Marks[i].item === item) { return i; } }
    return -1;
};
var l9CastReady = function() {
    return l9MarkWith("costume") >= 0 && l9MarkWith("plush") >= 0 && l9MarkWith("duck") >= 0 &&
        l9MarkWith("fox") >= 0 && l9MarkWith("bird") >= 0 && l9Bird.state === "landed" &&
        l9MarkWith("vend") >= 0 && l9Vend.hop === 2 && l9Beast.state === "up" &&
        l9RexStage.on && l9RexStage.x >= l9Marks[l9RexStage.mark].x - 2;
};
// first empty X, front row first (or back row first)
var l9FreeMark = function(backFirst) {
    var order = backFirst ? [4, 5, 6, 0, 1, 2, 3] : [0, 1, 2, 3, 4, 5, 6];
    for (var i = 0; i < order.length; i++) { if (l9Marks[order[i]].item === "") { return order[i]; } }
    return -1;
};
var l9MarkAt = function(x, y) {
    var best = -1; var bd = 9999;
    for (var i = 0; i < l9Marks.length; i++) {
        var d = dist(x, y, l9Marks[i].x, l9Marks[i].y - 10);
        if (l9Marks[i].item === "" && d < 34 && d < bd) { bd = d; best = i; }
    }
    return best;
};
var l9DrawSnackBag = function(x, y, r, g, b, rot) {
    pushMatrix(); translate(x, y); rotate(rot);
    noStroke();
    fill(r, g, b); rect(-5, -7, 10, 14, 1);
    triangle(-5, -7, -2.5, -9, 0, -7); triangle(0, -7, 2.5, -9, 5, -7);
    fill(255, 255, 255, 200); ellipse(0, 0, 6, 5);
    popMatrix();
};
// the duck squeaks out a pattern: 3 ... 1 ... 2
var L9_SQUEAKS = [0, 14, 28, 72, 116, 130];
var l9StartSqueak = function(x, y, onStage) {
    if (l9Squeak.t >= 0) { return; }
    l9Squeak = {t: 0, x: x, y: y, onStage: onStage};
};

// ---------- the cast, drawn the way they look in their own levels ----------
var l9DrawWerewolf = function(x, y, s, limp) {
    // same shapes as the level 1 werewolf (head centre at x, y)
    pushMatrix(); translate(x, y); scale(s);
    var droop = limp ? 22 : 0;
    stroke(77, 49, 0); strokeWeight(10);
    line(-22, 27, -52 + droop, 125);
    line(19, 27, 53 - droop, 125);
    line(19, 117, 25 - droop * 0.3, 189);
    line(-15, 117, -21 + droop * 0.3, 187);
    noStroke();
    fill(77, 49, 0);
    rect(-21, 22, 43, 100);
    // fur tufts
    for (var yy = 30; yy < 112; yy += 14) {
        triangle(-21, yy, -21, yy + 10, -28, yy + 3);
        triangle(22, yy, 22, yy + 10, 29, yy + 3);
    }
    ellipse(0, 0, 50, 50);
    for (var a = 20; a <= 160; a += 28) {
        triangle(cos(a) * 22 + sin(a) * 5, sin(a) * 22 - cos(a) * 5, cos(a) * 22 - sin(a) * 5, sin(a) * 22 + cos(a) * 5, cos(a) * 32, sin(a) * 32);
    }
    triangle(-18, -40, 0, -18, -19, 5);
    triangle(16, -40, 5, -18, 19, 5);
    triangle(-5, 8, 50, 12, -4, 17);
    // claws
    stroke(240, 240, 225); strokeWeight(1.5);
    line(-52 + droop, 125, -56 + droop, 133); line(-50 + droop, 126, -51 + droop, 134);
    line(53 - droop, 125, 57 - droop, 133); line(55 - droop, 126, 55 - droop, 134);
    noStroke();
    if (!limp) {
        fill(255, 40, 20, 55); ellipse(-10, 0, 14, 26); ellipse(9, 1, 14, 26);
        stroke(255, 0, 0); strokeWeight(1.5);
        line(-11, -9, -10, 10); line(9, -8, 9, 10);
        noStroke();
    } else {
        // empty eye holes: it's a costume
        fill(20, 12, 4); ellipse(-10, 0, 7, 12); ellipse(9, 1, 7, 12);
    }
    popMatrix();
};
var l9DrawMonster = function(x, y, s) {
    drawPurpleMonster(x, y, s, 150, 20, 200, 35 * s + sin(frameCount * 0.08) * 8);
};
var l9DrawFox = function(x, y) {
    drawFoxDetailed(x, y, false);
};
var l9DrawBird = function(x, y) {
    drawSongbird(x, y, 1.1, 180, 120, 60, 0, false);
};
var l9DrawEyeball = function(cx, cy) {
    noStroke();
    fill(240, 220, 200); ellipse(cx, cy, 20, 18);
    stroke(200, 80, 80, 150); strokeWeight(0.7);
    line(cx - 9, cy - 2, cx - 5, cy - 1); line(cx + 9, cy + 3, cx + 5, cy + 2);
    noStroke();
    fill(80, 200, 80); ellipse(cx, cy, 12, 12);
    fill(0); ellipse(cx + 1, cy, 6, 6);
    fill(255, 255, 255, 200); ellipse(cx + 3, cy - 2, 3, 3);
    stroke(200, 180, 160); strokeWeight(1);
    for (var t = 0; t < 5; t++) {
        var ta = t * 72 + frameCount * 2;
        line(cx + cos(ta) * 10, cy + sin(ta) * 9, cx + cos(ta) * 18, cy + sin(ta) * 16 + sin(frameCount * 0.1 + t) * 4);
    }
    noStroke();
};
var l9DrawDuck = function(x, y, sq) {
    noStroke();
    fill(255, 220, 40); ellipse(x, y, 34 * (2 - sq), 22 * sq);
    ellipse(x + 12, y - 16 + (1 - sq) * 6, 20, 18);
    fill(255, 140, 20); triangle(x + 20, y - 16, x + 30, y - 13, x + 20, y - 10);
    fill(0); ellipse(x + 15, y - 19, 3, 3);
    fill(240, 190, 20); ellipse(x - 4, y + 2, 16, 8);
};
var l9DrawVending = function(x, y, s) {
    pushMatrix(); translate(x, y); scale(s);
    noStroke();
    fill(185, 32, 44); rect(-120, -320, 240, 298, 6);
    fill(160, 25, 38); rect(110, -320, 10, 298);
    fill(255, 240, 200); textSize(12); textAlign(CENTER); text("SNAX", -32, -305);
    fill(28, 30, 40); rect(-108, -300, 150, 236, 3);
    var cols = [[230, 60, 50], [250, 190, 40], [60, 140, 230], [120, 200, 80], [200, 90, 200], [250, 130, 40]];
    for (var r = 0; r < 4; r++) {
        fill(80, 85, 95); rect(-106, -256 + r * 55 + 22, 146, 3);
        for (var c = 0; c < 4; c++) {
            var cc = cols[(r * 4 + c) % 6];
            fill(cc[0], cc[1], cc[2]);
            rect(-99 + c * 37, -268 + r * 55, 18, 24, 2);
        }
    }
    fill(45, 45, 52); rect(52, -300, 60, 236, 3);
    fill(20, 40, 25); rect(56, -294, 52, 22, 2);
    fill(200, 200, 205);
    for (var b = 0; b < 8; b++) { rect(b < 4 ? 58 : 84, -264 + (b % 4) * 18, 22, 14, 3); }
    fill(20, 20, 26); rect(-108, -56, 150, 40, 3);
    fill(60, 62, 70); rect(-104, -54, 142, 34, 2);
    fill(20, 20, 24); rect(-120, -22, 240, 22);
    popMatrix();
};
var l9DrawRex = function(x, y, state, face) {
    pushMatrix(); translate(x, y); scale(face, 1);
    noStroke();
    var lying = (state === "asleep" || state === "chewing");
    if (lying) {
        fill(0, 0, 0, 50); ellipse(2, 10, 70, 10);
        fill(165, 110, 60); ellipse(0, 0, 58, 24);
        fill(185, 130, 75); ellipse(4, 4, 34, 10);
        fill(165, 110, 60);
        ellipse(-26, 6, 16, 9);                          // back paw
        ellipse(20, 9, 20, 7); ellipse(28, 9, 14, 6);    // front paws
        // tail curled around
        stroke(165, 110, 60); strokeWeight(5); noFill();
        arc(-28, 2, 22, 18, 90, 260);
        noStroke();
        // head resting on paws
        fill(165, 110, 60); ellipse(26, -4, 24, 20);
        fill(185, 135, 80); ellipse(36, 1, 16, 11);
        fill(30); ellipse(43, -1, 5, 4);
        fill(120, 75, 40); ellipse(20, -6, 10, 18);    // floppy ear
        fill(200, 40, 40); rect(12, -4, 4, 14, 2);      // collar
        fill(240, 200, 60); ellipse(14, 11, 5, 5);      // tag
        if (state === "asleep") {
            stroke(40); strokeWeight(1.5); line(28, -6, 33, -6); noStroke();
        } else {
            fill(30); ellipse(31, -7, 4, 4);
        }
    } else {
        var step = sin(frameCount * 20) * (state === "walking" || state === "awake" ? 4 : 0);
        fill(0, 0, 0, 50); ellipse(2, 18, 60, 8);
        fill(165, 110, 60);
        rect(-20, 0, 7, 18 + step, 3); rect(-10, 0, 7, 18 - step, 3);
        rect(12, 0, 7, 18 - step, 3); rect(22, 0, 7, 18 + step, 3);
        ellipse(4, -2, 52, 24);
        fill(185, 130, 75); ellipse(6, 4, 30, 9);
        // wagging tail
        stroke(165, 110, 60); strokeWeight(5);
        line(-22, -6, -34, -18 + sin(frameCount * 35) * 6);
        noStroke();
        fill(165, 110, 60); ellipse(30, -16, 24, 22);
        fill(185, 135, 80); ellipse(41, -12, 18, 12);
        fill(30); ellipse(49, -14, 6, 5);
        fill(30); ellipse(34, -20, 4, 5);
        fill(255); ellipse(35, -21, 1.5, 1.5);
        fill(120, 75, 40); ellipse(24, -18, 10, 20);
        fill(200, 40, 40); rect(17, -12, 5, 16, 2);
        fill(240, 200, 60); ellipse(19, 6, 5, 5);
        if (state === "awake" || state === "walking") {
            fill(230, 90, 100); ellipse(44, -5, 6, 8);  // tongue out
        }
    }
    popMatrix();
};

// ---------- items, drawn like the real things ----------
var drawL9Item = function(type, x, y) {
    noStroke();
    if (type === "key") {
        fill(150, 115, 30); ellipse(x - 8, y + 1, 15, 15);
        fill(220, 180, 60); ellipse(x - 8, y, 14, 14);
        fill(0, 0, 0, 255); ellipse(x - 8, y, 5, 5);
        fill(240, 210, 110); ellipse(x - 11, y - 3, 4, 3);
        fill(220, 180, 60); rect(x - 2, y - 2, 18, 4, 1);
        rect(x + 8, y + 1, 3, 5); rect(x + 12, y + 1, 2, 4); rect(x + 4, y + 1, 2, 3);
        fill(240, 210, 110); rect(x - 1, y - 2, 16, 1);
    } else if (type === "flashlight") {
        fill(30, 30, 34); rect(x - 15, y - 4, 20, 9, 3);
        fill(50, 50, 56);
        for (var g = 0; g < 4; g++) { rect(x - 13 + g * 4, y - 4, 2, 9); }
        fill(170, 175, 185); quad(x + 5, y - 4, x + 13, y - 8, x + 13, y + 9, x + 5, y + 5);
        fill(210, 215, 225); rect(x + 12, y - 8, 3, 17, 1);
        if (l9Powered) { fill(255, 245, 170); } else { fill(90, 100, 110); }
        rect(x + 14, y - 6, 2, 13);
        fill(200, 50, 50); rect(x - 5, y - 6, 5, 2, 1);
    } else if (type === "batteries" || type === "nobatteries") {
        for (var b = 0; b < 2; b++) {
            var by = y - 7 + b * 9;
            if (type === "nobatteries") {
                noFill(); stroke(120, 120, 120); strokeWeight(1);
                rect(x - 11, by, 20, 7, 1);
                noStroke();
                continue;
            }
            fill(25, 25, 28); rect(x - 11, by, 20, 7, 1);
            fill(200, 120, 40); rect(x - 11, by, 8, 7, 1);
            fill(190); rect(x + 9, by + 2, 2, 3);
            fill(255); textSize(4); textAlign(CENTER); text("AA", x + 3, by + 5.5);
        }
        if (type === "nobatteries") {
            fill(150); textSize(5); textAlign(CENTER); text("not incl.", x, y + 13);
        }
    } else if (type === "duck") {
        fill(255, 220, 40); ellipse(x - 1, y + 3, 20, 13);
        ellipse(x + 6, y - 5, 12, 11);
        fill(255, 140, 20); triangle(x + 11, y - 5, x + 17, y - 3, x + 11, y - 1);
        fill(0); ellipse(x + 8, y - 7, 2, 2);
        fill(240, 190, 20); ellipse(x - 3, y + 3, 9, 5);
    } else if (type === "sandwich") {
        fill(200, 150, 80); triangle(x - 14, y + 7, x + 14, y + 7, x - 14, y - 10);
        fill(245, 225, 180); triangle(x - 12, y + 5, x + 9, y + 5, x - 12, y - 7);
        fill(110, 200, 80);
        for (var lf = 0; lf < 5; lf++) { ellipse(x - 12 + lf * 5, y + 8, 6, 4); }
        fill(230, 70, 60); rect(x - 13, y + 8, 24, 2);
        fill(250, 210, 80); rect(x - 13, y + 10, 26, 2);
        fill(200, 150, 80); rect(x - 14, y + 12, 28, 3, 1);
    } else if (type === "coin") {
        fill(190, 150, 40); ellipse(x, y + 1, 15, 15);
        fill(235, 200, 80); ellipse(x, y, 14, 14);
        fill(200, 160, 40); textSize(6); textAlign(CENTER); text("25", x, y + 2);
        fill(255, 240, 170, 160); ellipse(x - 3, y - 3, 4, 3);
    } else if (type === "wordkey") {
        fill(30); ellipse(x - 9, y, 16, 16); fill(240); ellipse(x - 9, y, 9, 9);
        fill(30); rect(x - 2, y - 2, 18, 4, 1); rect(x + 9, y + 2, 2, 5); rect(x + 13, y + 2, 2, 6);
        fill(200, 160, 60); textSize(5); textAlign(CENTER); text("KEY", x - 9, y + 2);
    } else if (type === "gem") {
        drawRainGem(x, y, 1.1);
    } else if (type === "hanger") {
        stroke(175); strokeWeight(1.6); noFill();
        arc(x, y - 7, 6, 6, 180, 360); line(x + 3, y - 7, x + 3, y - 4);
        line(x, y - 4, x - 12, y + 6); line(x, y - 4, x + 12, y + 6); line(x - 12, y + 6, x + 12, y + 6);
        noStroke();
    } else if (type === "bulb") {
        fill(255, 250, 220); ellipse(x, y - 3, 13, 14);
        fill(255, 255, 255, 200); ellipse(x - 3, y - 6, 3, 4);
        fill(160, 160, 165); rect(x - 4, y + 3, 8, 7, 1);
        stroke(120); strokeWeight(1); line(x - 4, y + 5, x + 4, y + 5); line(x - 4, y + 8, x + 4, y + 8); noStroke();
    } else if (type === "rainkey") {
        drawRainKey(x, y - 2, 0.62);
    } else if (type === "guppy") {
        drawRainGuppy(x, y + 1, 0.62);
    } else if (type === "fish") {
        drawStormFish(x, y, 0.17, 1);
    } else if (type === "tres") {
        drawTres(x, y + 1, 0.34, 0);
    } else if (type === "tres2") {
        drawTres(x, y + 5, 0.24, 1);
    } else if (type === "duster") {
        stroke(140, 90, 40); strokeWeight(2.5); line(x + 6, y + 10, x - 2, y - 2); noStroke();
        fill(240, 120, 150); ellipse(x - 5, y - 6, 12, 10); fill(250, 200, 120); ellipse(x - 9, y - 9, 9, 8); fill(150, 200, 250); ellipse(x - 3, y - 11, 8, 7);
    } else if (type === "hoard") {
        fill(150, 100, 40); ellipse(x, y + 4, 22, 18); fill(170, 120, 50); ellipse(x, y - 4, 14, 6);
        stroke(120, 80, 30); strokeWeight(1.5); line(x - 6, y - 4, x + 6, y - 4); noStroke();
        tresCoin(x - 4, y - 8, 8); tresCoin(x + 4, y - 9, 8); tresCoin(x, y - 12, 8);
    } else if (type === "celery") {
        fill(150, 210, 110); rect(x - 2, y - 6, 4, 16, 2);
        fill(120, 190, 90); rect(x - 2, y - 6, 1.5, 16);
        fill(90, 180, 70);
        ellipse(x - 3, y - 9, 6, 5); ellipse(x + 3, y - 10, 6, 5); ellipse(x, y - 12, 6, 5);
        fill(255); rect(x - 6, y + 2, 12, 5, 1);
        fill(40); textSize(3.5); textAlign(CENTER); text("DIET", x, y + 5.8);
    } else if (type === "seed") {
        fill(200, 170, 110); rect(x - 9, y - 10, 18, 20, 2);
        fill(180, 150, 90); rect(x - 9, y - 10, 18, 4, 2);
        fill(90, 60, 30); textSize(4); textAlign(CENTER); text("BIRD", x, y - 1); text("SEED", x, y + 4);
        fill(160, 120, 60); ellipse(x - 4, y + 7, 2, 2); ellipse(x, y + 8, 2, 2); ellipse(x + 4, y + 7, 2, 2);
    } else if (type === "bone") {
        fill(245, 240, 225);
        rect(x - 9, y - 2.5, 18, 5, 2);
        ellipse(x - 10, y - 3, 7, 7); ellipse(x - 10, y + 3, 7, 7);
        ellipse(x + 10, y - 3, 7, 7); ellipse(x + 10, y + 3, 7, 7);
        fill(215, 205, 185); rect(x - 7, y + 1, 14, 1.5);
    } else if (type === "costume") {
        stroke(170); strokeWeight(1); noFill(); line(x - 8, y - 9, x + 8, y - 9); line(x, y - 13, x, y - 9); noStroke();
        fill(77, 49, 10); rect(x - 5, y - 5, 10, 14, 2); ellipse(x, y - 6, 11, 10);
        triangle(x - 5, y - 9, x - 4, y - 15, x - 1, y - 10); triangle(x + 1, y - 10, x + 4, y - 15, x + 5, y - 9);
        fill(20, 12, 4); ellipse(x - 2, y - 6, 2, 3); ellipse(x + 2, y - 6, 2, 3);
    } else if (type === "plush") {
        l9DrawMonster(x - 3, y + 2, 0.75);
    } else if (type === "fuse") {
        fill(180, 185, 195); rect(x - 13, y - 4, 6, 8, 1); rect(x + 7, y - 4, 6, 8, 1);
        fill(200, 230, 255, 160); rect(x - 7, y - 3, 14, 6);
        stroke(120, 120, 130); strokeWeight(1); line(x - 7, y, x + 7, y); noStroke();
        fill(255, 255, 255, 140); rect(x - 6, y - 3, 12, 1);
    }
};

var drawL9Inventory = function() {
    if (l9Inv.length === 0) { return; }
    noStroke();
    fill(20, 20, 26, 230); rect(14, 360, 4 + l9Inv.length * 44, 34, 6);
    for (var i = 0; i < l9Inv.length; i++) {
        fill(40, 40, 50); rect(l9SlotX(i) - 19, 362, 38, 30, 4);
        if (l9Held.type === l9Inv[i]) { continue; }
        drawL9Item(l9Inv[i], l9SlotX(i), L9_SLOT_Y);
    }
};

var drawL9Says = function() {
    if (l9Says.t <= 0) { return; }
    l9Says.t--;
    textSize(11); textAlign(CENTER);
    var w = textWidth(l9Says.txt) + 12;
    var yy = l9Says.y - (110 - l9Says.t) * 0.12;
    fill(0, 0, 0, min(160, l9Says.t * 6)); rect(l9Says.x - w / 2, yy - 13, w, 18, 4);
    fill(255, 255, 255, min(255, l9Says.t * 8));
    text(l9Says.txt, l9Says.x, yy);
};

// where each credit item is on screen right now (or null)
var l9CreditItemPos = function(i) {
    var y = L9_WIN_BOT + 16 + i * L9_CREDIT_LH - l9Scroll;
    if (y < L9_WIN_TOP + 8 || y > L9_WIN_BOT - 4) { return null; }
    textSize(11);
    return [210 + textWidth(l9Credits[i][1]) + 22, y - 4];
};

var drawL9EndCard = function() {
    background(0);
    noFill(); stroke(255, 255, 255, 50); strokeWeight(1);
    rect(12, 12, 376, 376);
    noStroke();
    fill(255); textAlign(CENTER); textSize(46);
    text("THE END", 200, 78);
    var promises = ["(for real)", "(pinky promise)", "(okay, probably)", "(stop clicking me)"];
    fill(170); textSize(15);
    text(promises[l9Promise], 200, 104);
    l9Scroll += 0.55;
    var total = l9Credits.length * L9_CREDIT_LH + (L9_WIN_BOT - L9_WIN_TOP) + 30;
    if (l9Scroll > total) { l9Scroll = 0; }
    for (var i = 0; i < l9Credits.length; i++) {
        var c = l9Credits[i];
        var y = L9_WIN_BOT + 16 + i * L9_CREDIT_LH - l9Scroll;
        if (y < L9_WIN_TOP || y > L9_WIN_BOT + 10) { continue; }
        var edge = min(y - L9_WIN_TOP, L9_WIN_BOT - y);
        var a = constrain(edge * 8, 0, 255);
        textSize(11);
        if (c[1] === "") {
            fill(230, 230, 230, a); textAlign(CENTER); text(c[0], 200, y);
        } else {
            fill(150, 150, 160, a); textAlign(RIGHT); text(c[0], 194, y);
            fill(240, 240, 240, a); textAlign(LEFT); text(c[1], 210, y);
        }
        if (c[2] !== "" && !l9Taken[c[2]] && (c[2] !== "gem" || l9Rain.door)) {
            var p = l9CreditItemPos(i);
            if (p) { drawL9Item(c[2], p[0], p[1]); }
        }
    }
    // the staff door (very, very faint)
    var dx = L9_DOOR_X + (l9Door.rattle > 0 ? random(-1.5, 1.5) : 0);
    if (l9Door.rattle > 0) { l9Door.rattle--; }
    if (!l9Door.open) {
        noFill(); stroke(30, 30, 30); strokeWeight(1);
        rect(dx, L9_DOOR_Y, 28, 48);
        noStroke(); fill(36, 36, 36); ellipse(dx + 22, L9_DOOR_Y + 26, 3, 3);
        fill(34, 34, 34); rect(dx + 19, L9_DOOR_Y + 30, 6, 5, 1);
        fill(30, 30, 30); textSize(5); textAlign(CENTER); text("STAFF ONLY", dx + 14, L9_DOOR_Y + 10);
        fill(28, 28, 30); rect(dx + 4, L9_DOOR_Y + 18, 9, 11, 1);
        fill(l9Door.locked ? 45 : 140, l9Door.locked ? 20 : 30, 20); ellipse(dx + 8.5, L9_DOOR_Y + 20, 2, 2);
    } else {
        fill(255, 220, 150, 40 + 20 * sin(frameCount * 4)); rect(dx - 6, L9_DOOR_Y - 6, 40, 60, 4);
        fill(255, 230, 170); rect(dx, L9_DOOR_Y, 28, 48);
        fill(60, 40, 30); quad(dx, L9_DOOR_Y, dx - 10, L9_DOOR_Y - 4, dx - 10, L9_DOOR_Y + 52, dx, L9_DOOR_Y + 48);
    }
};

var drawL9Backstage = function() {
    noStroke();
    background(52, 36, 30);
    fill(62, 42, 34);
    for (var by = 20; by < 300; by += 20) {
        for (var bx = ((by / 20) % 2) * 20; bx < 400; bx += 40) { rect(bx, by, 36, 16); }
    }
    fill(90, 62, 40); rect(0, 300, 400, 100);
    fill(80, 55, 35);
    for (var fl = 300; fl < 400; fl += 14) { rect(0, fl, 400, 1); }
    // stage lights strung along the top (they come on with the power)
    stroke(40); strokeWeight(1); line(0, 8, 400, 14); noStroke();
    for (var sl = 0; sl < 10; sl++) {
        var lx0 = 20 + sl * 40;
        if (l9Power) { fill(255, 230, 140, 60); ellipse(lx0, 18, 20, 20); fill(255, 240, 170); } else { fill(70, 65, 60); }
        ellipse(lx0, 16, 8, 10);
    }
    // ropes + sandbag
    stroke(170, 150, 110); strokeWeight(2);
    line(150, 0, 150, 60); line(330, 0, 330, 70);
    noStroke(); fill(140, 120, 90); ellipse(330, 82, 22, 26);
    fill(120, 100, 75); rect(322, 70, 16, 4);
    // costume rack with the werewolf costume hanging limp
    fill(70, 70, 76); rect(24, 104, 4, 196); rect(116, 104, 4, 196); rect(24, 104, 96, 4);
    if (!l9Rain.hanger) {
        stroke(170); strokeWeight(2); noFill();
        arc(70, 112, 8, 8, 180, 360); line(66, 116, 54, 124); line(74, 116, 86, 124); line(54, 124, 86, 124);
        noStroke();
    }
    if (!l9Costume.taken) {
        l9DrawWerewolf(70, 146, 0.44, true);
        stroke(200, 200, 205); strokeWeight(1);
        line(70, 157, 70, 196);                   // zipper
        noStroke();
        fill(240, 235, 220); rect(84, 196, 34, 14, 1);
        fill(40); textSize(5); textAlign(CENTER); text("WEREWOLF", 101, 202); text("(costume)", 101, 208);
    }
    // cardboard moon on a stick (same moon as level 1, but... cardboard)
    fill(150, 120, 80); rect(166, 120, 4, 180);
    fill(170, 140, 95); ellipse(168, 94, 54, 54);   // cardboard edge
    fill(245, 245, 235); ellipse(168, 94, 50, 50);
    fill(215, 215, 205);
    ellipse(160, 88, 12, 10); ellipse(177, 101, 9, 8); ellipse(174, 83, 6, 5); ellipse(159, 104, 7, 6);
    fill(198, 198, 188); ellipse(161, 89, 6, 5); ellipse(178, 102, 4, 4);
    fill(230, 225, 180, 200); rect(164, 112, 8, 12);  // tape
    // a fox is hiding behind the moon...
    if (l9Fox.state === "hiding") {
        // ear tips peeking over the top + a bushy tail sticking out the side
        fill(205, 110, 35);
        triangle(157, 70, 160, 60, 164, 69); triangle(165, 69, 169, 59, 172, 70);
        fill(60, 30, 15); triangle(159, 69, 160, 63, 162, 69); triangle(167, 69, 169, 62, 170, 69);
        pushMatrix(); translate(192, 106); rotate(20 + sin(frameCount * 5) * 8);
        fill(205, 110, 35); ellipse(8, 0, 22, 10);
        fill(250, 248, 240); ellipse(17, 0, 8, 8);
        popMatrix();
    } else if (l9Fox.state === "eating") {
        l9Fox.t++;
        drawFoxDetailed(150, 284, false);
        drawL9Item("sandwich", 192, 296);
        if (l9Fox.t % 20 === 0) { l9Say("nom", 190, 270); }
        if (l9Fox.t > 80) { l9Fox.state = "leaving"; l9Fox.t = 0; }
    } else if (l9Fox.state === "leaving") {
        l9Fox.t++;
        drawFoxDetailed(150 + l9Fox.t * 3.5, 284, true);
        if (150 + l9Fox.t * 3.5 > 430) { l9Fox.state = "gone"; }
    }
    // fuse box
    fill(110, 115, 125); rect(352, 118, 36, 52, 3);
    fill(90, 95, 105); rect(352, 118, 36, 6, 3);
    if (l9Fuse.open) {
        fill(40, 42, 48); rect(356, 128, 28, 38);
        fill(140, 140, 150); rect(362, 140, 4, 12); rect(374, 140, 4, 12);
        if (l9Fuse.inBox) { drawL9Item("fuse", 370, 146); }
        fill(100, 105, 115); quad(352, 124, 338, 120, 338, 172, 352, 170);  // door swung open
    } else {
        fill(130, 135, 145); rect(356, 128, 28, 38, 2);
        fill(250, 210, 60); triangle(370, 134, 362, 150, 378, 150);
        fill(40); textSize(10); textAlign(CENTER); text("!", 370, 148);
        fill(40); textSize(5); text("FUSES", 370, 160);
    }
    // the lever
    var lx = L9_LEVER_X; var ly = L9_LEVER_Y;
    fill(250, 210, 60); rect(lx - 40, 214, 80, 18, 3);
    fill(40); textSize(9); textAlign(CENTER); text("REAL ENDING", lx, 227);
    fill(60, 60, 66); rect(lx - 30, ly - 10, 60, 22, 3);
    fill(80, 80, 88); rect(lx - 30, ly - 10, 60, 4, 3);
    fill(l9Power ? 80 : 160, l9Power ? 230 : 30, l9Power ? 100 : 30); ellipse(lx + 22, ly + 2, 6, 6);
    stroke(150, 150, 160); strokeWeight(5);
    var kx = lx + sin(l9Lever.ang) * 46; var ky = ly - cos(l9Lever.ang) * 46;
    line(lx, ly - 4, kx, ky);
    noStroke(); fill(220, 40, 40); ellipse(kx, ky, 16, 16);
    fill(255, 140, 140); ellipse(kx - 3, ky - 3, 5, 5);
    // crate of spare ENDs + the purple monster plush
    fill(140, 100, 60); rect(296, 274, 80, 46, 2);
    fill(120, 85, 50); rect(296, 274, 80, 6); rect(296, 296, 80, 3);
    if (l9LettersOut() === 3 && !l9Fuse.found) {
        fill(30, 20, 14); rect(300, 278, 72, 8);
        drawL9Item("fuse", 336, 280);
    }
    fill(30); textSize(9); textAlign(CENTER); text("SPARE ENDS", 336, 314);
    for (var li = 0; li < l9Letters.length; li++) {
        var L = l9Letters[li];
        if (L.out && L.y < 372) {
            L.vy += 0.5; L.x += L.vx; L.y += L.vy; L.rot += L.vx * 4;
            if (L.y >= 372) { L.y = 372; L.vx = 0; L.vy = 0; }
        }
        pushMatrix(); translate(L.x, L.y); rotate(L.rot);
        fill(250); textSize(22); textAlign(CENTER); text(L.ch, 0, 8);
        popMatrix();
    }
    if (!l9Plush.taken) {
        l9DrawMonster(262, 352, 1.1);
        fill(240); rect(248, 364, 26, 7, 1);
        fill(40); textSize(5); text("PLUSH", 261, 369);
    }
    // the rubber duck on the floor
    if (l9Duck.on) {
        l9DrawDuck(l9Duck.x, 360, 1);
    }
    // Rex
    if (!l9RexStage.on) {
        l9DrawRex(l9Rex.x, l9Rex.y, l9Rex.state === "bone" ? "chewing" : l9Rex.state, l9Rex.face);
        if (l9Rex.state === "bone") {
            pushMatrix(); translate(l9Rex.x + l9Rex.face * 40, l9Rex.y + 4); rotate(sin(frameCount * 12) * 10);
            drawL9Item("bone", 0, 0); popMatrix();
        }
    }
    if (l9Rex.state === "asleep" && frameCount % 80 < 60) {
        fill(255, 255, 255, 180); textSize(10); textAlign(CENTER);
        text("z", l9Rex.x + 40, l9Rex.y - 18 - (frameCount % 80) * 0.2);
        text("z", l9Rex.x + 48, l9Rex.y - 28 - (frameCount % 80) * 0.2);
    }
    // the flashlight lying on the floor
    if (l9Lit) {
        pushMatrix(); translate(l9LampX, 352); rotate(-90);
        drawL9Item("flashlight", 0, 0);
        popMatrix();
    }
    // the EXIT sign (the only light at first)
    var exitOn = l9Exit.batteries;
    if (exitOn && !l9Lit) { fill(60, 255, 120, 30); ellipse(60, 42, 110, 60); }
    fill(30, 30, 34); rect(30, 30, 60, 24, 3);
    fill(exitOn ? 60 : 30, exitOn ? 230 : 60, exitOn ? 110 : 40);
    textSize(14); textAlign(CENTER); text("EXIT", 54, 47);
    if (exitOn) { triangle(78, 42, 72, 37, 72, 47); } else { fill(20); rect(70, 34, 16, 16); }
    // darkness
    if (!l9Lit && !l9Power) {
        fill(0, 0, 0, 246); rect(0, 0, 400, 400);
        if (exitOn) {
            fill(60, 255, 120, 22); ellipse(60, 42, 140, 80);
            fill(60, 230, 110); textSize(14); textAlign(CENTER); text("EXIT", 54, 47);
            triangle(78, 42, 72, 37, 72, 47);
        }
    } else if (!l9Power) {
        fill(255, 240, 180, 18);
        triangle(l9LampX, 340, l9LampX - 220, 0, l9LampX + 220, 0);
        noFill();
        stroke(0, 0, 0, 120); strokeWeight(140); ellipse(l9LampX, 200, 640, 560);
        stroke(0, 0, 0, 70); strokeWeight(60); ellipse(l9LampX, 200, 470, 430);
        noStroke(); strokeWeight(1);
    }
    fill(255, 255, 255, 120); textSize(18); textAlign(CENTER); text("<", 14, 206);
    if (l9StageOpen) {
        fill(255, 230, 150, 150 + 80 * sin(frameCount * 5)); text(">", 388, 206);
        fill(255, 230, 150, 120); textSize(7); text("STAGE", 384, 220);
    }
};

// ---------- the stage (the curtain is up... but the cast is missing) ----------
// ---------- TRES: the treasure room behind the stage (pull the curtain rope to the RIGHT) ----------
// the puzzles get made the first time you walk in
var TRES_PILES = [[92, 176], [322, 214], [336, 304]];
var tresPerms = function(n) {
    var out = [[]];
    for (var k = 0; k < n; k++) {
        var nxt = [];
        for (var i = 0; i < out.length; i++) {
            for (var v = 0; v < n; v++) {
                if (out[i].indexOf(v) < 0) { var c = out[i].slice(0); c.push(v); nxt.push(c); }
            }
        }
        out = nxt;
    }
    return out;
};
// ---- the RING LOCK: put the 5 treasure symbols in the right order (logic clues) ----
var tresPosOf = function(perm, sym) { return perm.indexOf(sym); };
var tresClueOk = function(cl, perm) {
    var pa = tresPosOf(perm, cl.a); var pb = tresPosOf(perm, cl.b);
    if (cl.t === "left") { return pa < pb; }
    if (cl.t === "next") { return abs(pa - pb) === 1; }
    if (cl.t === "notnext") { return abs(pa - pb) !== 1; }
    if (cl.t === "end") { return pa === 0 || pa === perm.length - 1; }
    if (cl.t === "notend") { return pa > 0 && pa < perm.length - 1; }
    if (cl.t === "two") { return pa === pb + 2; }
    return true;
};
var tresClueText = function(cl) {
    var A = "the " + TRES_SYM_NAMES[cl.a]; var B = "the " + TRES_SYM_NAMES[cl.b];
    if (cl.t === "left") { return A + " is somewhere LEFT of " + B + "."; }
    if (cl.t === "next") { return A + " is right NEXT TO " + B + "."; }
    if (cl.t === "notnext") { return A + " is NOT next to " + B + "."; }
    if (cl.t === "end") { return A + " is on one of the ENDS."; }
    if (cl.t === "notend") { return A + " is NOT on an end."; }
    return A + " is exactly 2 spots to the RIGHT of " + B + ".";
};
var tresMakeRing = function() {
    var all = tresPerms(6);
    var ans = all[floor(random(0, all.length))];
    var kinds = ["left", "left", "next", "notnext", "end", "notend", "two", "two"];
    var cand = all.slice(0);
    var clues = [];
    var tries = 0;
    while (cand.length > 1 && tries < 400) {
        tries++;
        var cl = {t: kinds[floor(random(0, kinds.length))], a: floor(random(0, 6)), b: floor(random(0, 6))};
        if (cl.a === cl.b) { continue; }
        if (!tresClueOk(cl, ans)) { continue; }
        var keep = [];
        for (var i = 0; i < cand.length; i++) { if (tresClueOk(cl, cand[i])) { keep.push(cand[i]); } }
        if (keep.length < cand.length) { cand = keep; clues.push(cl); }
    }
    // throw away clues you don't actually need (makes it harder)
    for (var r = clues.length - 1; r >= 0; r--) {
        var test = clues.slice(0); test.splice(r, 1);
        var n = 0;
        for (var p = 0; p < all.length && n < 2; p++) {
            var ok = true;
            for (var q = 0; q < test.length; q++) { if (!tresClueOk(test[q], all[p])) { ok = false; break; } }
            if (ok) { n++; }
        }
        if (n === 1) { clues = test; }
    }
    l9Tres.ans = ans; l9Tres.clues = clues;
    l9Tres.rk = [0, 0, 0, 0, 0, 0];
};
// ---- the COIN TOWERS: 4x4, each row + column has a stack of 1, 2, 3 and 4. clues = how many stacks you can SEE ----
var tresSee = function(arr) {
    var best = 0; var n = 0;
    for (var i = 0; i < arr.length; i++) { if (arr[i] > best) { best = arr[i]; n++; } }
    return n;
};
var tresLine = function(g, k) {
    // 0-3 top (look down), 4-7 bottom (look up), 8-11 left (look right), 12-15 right (look left)
    var out = []; var i;
    if (k < 4) { for (i = 0; i < 4; i++) { out.push(g[i * 4 + k]); } }
    else if (k < 8) { for (i = 3; i >= 0; i--) { out.push(g[i * 4 + k - 4]); } }
    else if (k < 12) { for (i = 0; i < 4; i++) { out.push(g[(k - 8) * 4 + i]); } }
    else { for (i = 3; i >= 0; i--) { out.push(g[(k - 12) * 4 + i]); } }
    return out;
};
var tresSquares = [];
var tresMakeSquares = function() {
    if (tresSquares.length > 0) { return; }
    var rows = tresPerms(4);
    var build = function(sofar) {
        if (sofar.length === 16) { tresSquares.push(sofar); return; }
        for (var r = 0; r < rows.length; r++) {
            var ok = true;
            for (var c = 0; c < 4 && ok; c++) {
                for (var pr = 0; pr * 4 < sofar.length; pr++) { if (sofar[pr * 4 + c] === rows[r][c] + 1) { ok = false; break; } }
            }
            if (ok) {
                var nx = sofar.slice(0);
                for (var c2 = 0; c2 < 4; c2++) { nx.push(rows[r][c2] + 1); }
                build(nx);
            }
        }
    };
    build([]);
};
var tresCountTowers = function(clue) {
    var n = 0;
    for (var s = 0; s < tresSquares.length && n < 2; s++) {
        var ok = true;
        for (var k = 0; k < 16; k++) {
            if (clue[k] > 0 && tresSee(tresLine(tresSquares[s], k)) !== clue[k]) { ok = false; break; }
        }
        if (ok) { n++; }
    }
    return n;
};
var tresMakeTowers = function() {
    var P = TW5_DATA[floor(random(0, TW5_DATA.length))];
    l9Tres.tSol = P[0]; l9Tres.tClue = P[1];
    l9Tres.tw = [];
    for (var z = 0; z < 25; z++) { l9Tres.tw.push(0); }
};
// ---- the SUN WELL: flip mirrors so the sunlight goes through all 3 gems and into the altar's crystal ----
var TB_N = 6;
var TB_X = 98;
var TB_Y = 82;
var TB_S = 34;
var tresBeamRun = function() {
    var B = l9Tres.bm; var N = TB_N; var S = TB_S;
    var c = 0; var r = B.r0; var dx = 1; var dy = 0;
    var pts = [[TB_X - 14, TB_Y + B.r0 * S + S / 2]];
    var gems = {}; var hit = 0; var blocked = 0;
    for (var st = 0; st < 80; st++) {
        if (c < 0 || r < 0 || c >= N || r >= N) { break; }
        var cell = B.cells[r * N + c];
        pts.push([TB_X + c * S + S / 2, TB_Y + r * S + S / 2]);
        if (cell.k === 2) { blocked = 1; break; }
        if (cell.k === 3 && !gems[c + "," + r]) { gems[c + "," + r] = 1; hit++; }
        if (cell.k === 1) {
            var ndx; var ndy;
            if (cell.o === 0) { ndx = -dy; ndy = -dx; } else { ndx = dy; ndy = dx; }
            dx = ndx; dy = ndy;
        }
        c += dx; r += dy;
    }
    if (!blocked) { pts.push([TB_X + c * S + S / 2 - dx * S * 0.15, TB_Y + r * S + S / 2 - dy * S * 0.15]); }
    B.pts = pts; B.hit = hit;
    B.ok = (!blocked && r === N && c === B.ex && hit === 4) ? 1 : 0;
};
var tresMakeBeam = function() {
    var N = TB_N;
    for (var tries = 0; tries < 4000; tries++) {
        var r0 = floor(random(0, N));
        var seen = {}; var path = [];
        var c = 0; var r = r0; var dx = 1; var dy = 0; var ok = false; var exitC = -1;
        for (var step = 0; step < 40; step++) {
            seen[c + "," + r] = 1;
            var opts = [[dx, dy], [dx, dy], [-dy, dx], [dy, -dx]];
            var order = [];
            for (var o = 0; o < 4; o++) { order.splice(floor(random(0, order.length + 1)), 0, o); }
            var chosen = null; var exits = false;
            for (var q = 0; q < 4; q++) {
                var op = opts[order[q]];
                var nc = c + op[0]; var nr = r + op[1];
                if (nc < 0 || nr < 0 || nc >= N || nr >= N) {
                    if (op[0] === 0 && op[1] === 1 && path.length >= 12) { chosen = op; exits = true; break; }
                    continue;
                }
                if (seen[nc + "," + nr]) { continue; }
                chosen = op; break;
            }
            if (chosen === null) { break; }
            var turn = (chosen[0] !== dx || chosen[1] !== dy);
            path.push({c: c, r: r, turn: turn, o: turn ? ((chosen[0] === -dy && chosen[1] === -dx) ? 0 : 1) : -1});
            dx = chosen[0]; dy = chosen[1];
            if (exits) { ok = true; exitC = c; break; }
            c += dx; r += dy;
        }
        if (!ok) { continue; }
        var mirrors = 0; var straights = [];
        for (var p = 0; p < path.length; p++) { if (path[p].turn) { mirrors++; } else { straights.push(p); } }
        if (mirrors < 6 || straights.length < 4) { continue; }
        // build the grid
        var cells = [];
        for (var i = 0; i < N * N; i++) {
            var rv = random(0, 1);
            if (rv < 0.45) { cells.push({k: 1, o: floor(random(0, 2))}); }
            else if (rv < 0.6) { cells.push({k: 2, o: 0}); }
            else { cells.push({k: 0, o: 0}); }
        }
        for (var p2 = 0; p2 < path.length; p2++) {
            var P = path[p2];
            if (P.turn) { cells[P.r * N + P.c] = {k: 1, o: floor(random(0, 2)), sol: P.o}; }
            else { cells[P.r * N + P.c] = {k: 0, o: 0}; }
        }
        for (var g = 0; g < 4; g++) {
            var pick = floor(random(0, straights.length));
            var GP = path[straights[pick]];
            cells[GP.r * N + GP.c] = {k: 3, o: 0};
            straights.splice(pick, 1);
        }
        l9Tres.bm = {cells: cells, r0: r0, ex: exitC, pts: [], ok: 0, hit: 0};
        tresBeamRun();
        if (l9Tres.bm.ok) {
            // it can't start out solved: knock one path mirror the wrong way
            for (var p3 = 0; p3 < path.length; p3++) {
                if (path[p3].turn) { var ce = cells[path[p3].r * N + path[p3].c]; ce.o = 1 - ce.sol; break; }
            }
            tresBeamRun();
        }
        return;
    }
};
// places in the treasure room where cups, gems, swords and crowns can be lying around
var TRES_SPOTS = [[128, 26], [160, 34], [196, 22], [244, 30], [276, 24], [118, 62], [282, 60], [16, 128], [16, 178], [386, 166], [388, 214],
    [70, 322], [32, 338], [118, 322], [270, 330], [296, 318], [130, 140], [272, 124], [114, 100], [226, 60], [170, 64], [386, 262]];
var TRES_BOX_SYM = [3, 1, 5, 2];
var tresGenerate = function() {
    if (l9Tres.gen) { return; }
    l9Tres.gen = 1;
    l9Tres.dPile = floor(random(0, 3));
    // stuff lying around the room (the box code = how many of each)
    var spots = TRES_SPOTS.slice(0);
    for (var sh = spots.length - 1; sh > 0; sh--) { var sj = floor(random(0, sh + 1)); var st = spots[sh]; spots[sh] = spots[sj]; spots[sj] = st; }
    l9Tres.cnt = [2 + floor(random(0, 3)), 3 + floor(random(0, 3)), 1 + floor(random(0, 3)), 2 + floor(random(0, 3))];
    l9Tres.items = [];
    var kinds = [3, 1, 5, 2];
    for (var ki = 0; ki < 4; ki++) { for (var kn = 0; kn < l9Tres.cnt[ki]; kn++) { var sp = spots.pop(); l9Tres.items.push([kinds[ki], sp[0], sp[1]]); } }
    l9Tres.box = 0; l9Tres.boxOpen = 0; l9Tres.boxDial = [0, 0, 0, 0];
    tresMakeRing();
    tresMakeTowers();
    tresMakeBeam();
};
var tresReady = function() { return l9Tres.dust <= 0 && l9Tres.ring && l9Tres.hoard === 2 && l9Tres.lit; };

// ---- the back curtain on the stage (opens when you pull the rope to the right) ----
var drawL9BackCurtain = function() {
    if (!l9Tres.back) { return; }
    if (l9Tres.backT < 90) { l9Tres.backT++; }
    var k = l9Tres.backT / 90; k = k * k * (3 - 2 * k);
    noStroke();
    // the treasure room behind it
    fill(60, 38, 12); rect(110, 20, 180, 232);
    fill(255, 210, 90, 50 + sin(frameCount * 4) * 20); ellipse(200, 170, 200, 200);
    fill(120, 80, 20); arc(200, 60, 140, 80, 180, 360);
    for (var p = 0; p < 9; p++) {
        var px = 120 + (p * 29) % 170; var py = 210 + (p % 3) * 14;
        fill(200, 150, 40); ellipse(px, py + 10, 50, 26);
        fill(245, 200, 70); ellipse(px, py + 6, 42, 20);
    }
    for (var c = 0; c < 12; c++) { tresCoin(124 + (c * 41) % 160, 200 + (c * 17) % 40, 9); }
    tresGem(150, 196, 10, 230, 40, 70); tresGem(246, 200, 10, 60, 200, 110); tresGem(206, 186, 12, 70, 140, 255);
    fill(220, 170, 60); rect(176, 150, 48, 40, 3); fill(250, 210, 90); rect(170, 146, 60, 8, 2);
    for (var s = 0; s < 4; s++) { tresSparkle(130 + (s * 47 + frameCount) % 150, 100 + (s * 31) % 90, 4 + sin(frameCount * 8 + s * 60) * 2, 230); }
    // the two halves of the back curtain, sliding apart
    var w = 90 * (1 - k) + 14;
    fill(140, 18, 30); rect(110, 20, w, 232); rect(290 - w, 20, w, 232);
    fill(115, 10, 22);
    for (var f = 0; f < 5; f++) { rect(110 + f * w / 5 + 4, 20, 2, 232); rect(290 - w + f * w / 5 + 4, 20, 2, 232); }
    fill(100, 8, 18); rect(106, 14, 188, 10, 2);
    if (k >= 1) {
        fill(255, 230, 120, 140 + sin(frameCount * 6) * 80); textSize(9); textAlign(CENTER); text("(click to go in)", 200, 112);
    }
};
var drawL9TresStage = function() {
    if (!l9Tres.onStage) { return; }
    var fy = l9Tres.sy + sin(frameCount * 3) * 4;
    fill(255, 220, 100, 40); noStroke(); ellipse(l9Tres.sx, fy, 90, 80);
    drawTres(l9Tres.sx, fy, 0.5, 1);
};
// ---- the reward chest in the Letter Vault ----
var drawL9TresChest = function() {
    var T = l9Tres;
    noStroke();
    fill(255, 220, 100, 40 + sin(frameCount * 4) * 20); ellipse(200, 230, 260, 180);
    if (T.chest) { T.chestT = min(60, T.chestT + 1); }
    var lid = T.chest ? min(1, T.chestT / 20) : 0;
    // inside of the chest
    fill(40, 22, 10); rect(134, 200, 132, 18);
    // Tres (rising out of the chest)
    if (T.chest && !T.got) {
        var ry = 230 - min(1, T.chestT / 50) * 70;
        drawTres(200, ry + sin(frameCount * 4) * 3, 0.9, 0);
    }
    // the chest body
    fill(90, 56, 26); rect(130, 210, 140, 80, 6);
    stroke(70, 44, 20); strokeWeight(1); for (var pk = 0; pk < 3; pk++) { line(132, 226 + pk * 20, 268, 226 + pk * 20); } noStroke();
    fill(170, 130, 40); rect(130, 280, 140, 10, 3); rect(136, 210, 8, 80); rect(256, 210, 8, 80); rect(194, 210, 12, 80);
    fill(200, 160, 60); rect(130, 240, 140, 8);
    fill(240, 210, 120); for (var rv = 0; rv < 5; rv++) { ellipse(140 + rv * 30, 244, 3, 3); }
    fill(70, 44, 20); rect(186, 250, 28, 24, 4);
    fill(20); ellipse(200, 259, 6, 6); rect(198, 259, 4, 8);
    // the lid (swings open)
    var lh = 44 * (1 - lid) + 6;
    fill(110, 70, 34); arc(200, 212, 140, lh * 2, 180, 360);
    fill(200, 160, 60); rect(194, 212 - lh, 12, lh); rect(130, 208, 140, 5);
    if (lid >= 1) { fill(110, 70, 34); rect(130, 140, 140, 16, 4); fill(200, 160, 60); rect(194, 140, 12, 16); }
    // gold coins spilling around it
    for (var cn = 0; cn < 9; cn++) { tresCoin(110 + cn * 22 + (cn % 2) * 6, 296 + (cn % 3) * 4, 13); }
    textAlign(CENTER);
    if (!T.chest) { fill(255, 255, 255, 140 + sin(frameCount * 5) * 60); textSize(11); text("(click the chest)", 200, 330); }
    else if (!T.got && T.chestT >= 50) { fill(255, 230, 120); textSize(11); text("it's a blob... made of TREASURE.  (click it)", 200, 330); }
    else if (T.got) { fill(200, 190, 160); textSize(10); text("the chest is empty now. (Tres is in your bag)", 200, 330); }
};
var l9TresChestPressed = function() {
    var T = l9Tres;
    if (!T.chest && mouseX > 130 && mouseX < 270 && mouseY > 160 && mouseY < 292) {
        T.chest = 1; T.chestT = 0;
        shake(4); flash(255, 230, 140, 90);
        burst(200, 210, 255, 220, 100, 30, 3, 0.05);
        l9Say("the chest creaks open... something GLOOPY climbs out!", 200, 360);
        return;
    }
    if (T.chest && !T.got && T.chestT >= 50 && dist(mouseX, mouseY, 200, 160) < 40) {
        T.got = 1; l9Inv.push("tres");
        burst(200, 160, 255, 220, 100, 20, 2.5, 0);
        l9Say("blorp! \"i'm TRES. i'm made of treasure.\" (Tres hops in your bag)", 200, 360);
    }
};

// ---- the treasure room itself (l9Scene 7) ----
var drawL9TresBg = function() {
    noStroke();
    background(40, 26, 10);
    for (var r = 0; r < 12; r++) {
        for (var c = 0; c < 9; c++) {
            fill(70 + (r * 7 + c * 13) % 16, 48 + (r * 5 + c * 11) % 12, 16 + (r * 3) % 8);
            rect(c * 48 + (r % 2) * 24 - 24 + 1, r * 30 + 1, 46, 28, 3);
        }
    }
    // gold pillars
    for (var p = 0; p < 2; p++) {
        var px = p === 0 ? 14 : 372;
        fill(170, 120, 30); rect(px, 0, 14, 360);
        fill(230, 180, 60); rect(px + 3, 0, 4, 360);
    }
    // heaps of treasure everywhere (the floor)
    fill(140, 95, 20); rect(0, 330, 400, 70);
    for (var h = 0; h < 14; h++) {
        var hx = (h * 61) % 420 - 10; var hy = 330 + (h % 3) * 6;
        fill(200, 150, 40); ellipse(hx, hy + 6, 80, 36);
        fill(245, 200, 70); ellipse(hx, hy, 70, 28);
    }
    for (var c2 = 0; c2 < 16; c2++) { tresCoin((c2 * 53) % 400, 322 + (c2 * 7) % 20, 10); }
    // treasure map on the wall
    fill(220, 200, 150); rect(34, 56, 70, 52, 2);
    fill(190, 165, 115); rect(34, 56, 70, 5);
    for (var m = 0; m < 3; m++) {
        var mx = 40 + (TRES_PILES[m][0] - 40) * 0.17; var my = 68 + (TRES_PILES[m][1] - 180) * 0.2;
        fill(200, 160, 70); ellipse(mx + 4, my + 4, 14, 8);
    }
    var dm = TRES_PILES[l9Tres.dPile];
    stroke(200, 30, 30); strokeWeight(2);
    var xx = 40 + (dm[0] - 40) * 0.17 + 4; var xy = 68 + (dm[1] - 180) * 0.2 + 4;
    line(xx - 4, xy - 4, xx + 4, xy + 4); line(xx + 4, xy - 4, xx - 4, xy + 4);
    noStroke();
    fill(90, 60, 20); textSize(6); textAlign(CENTER); text("X = THE BOX", 69, 103);
    // the sparkles
    for (var s = 0; s < 8; s++) { tresSparkle((s * 89 + frameCount * 0.4) % 400, (s * 47) % 300 + 20, 3 + sin(frameCount * 7 + s * 40) * 2, 200); }
};
var drawL9TresPanelBox = function(title, sub) {
    noStroke();
    fill(0, 0, 0, 160); rect(0, 0, 400, 400);
    fill(90, 60, 20); rect(22, 30, 356, 322, 8);
    fill(50, 34, 14); rect(28, 36, 344, 310, 6);
    fill(240, 200, 90); textSize(13); textAlign(CENTER); text(title, 200, 56);
    fill(200, 180, 130); textSize(8); text(sub, 200, 68);
    fill(180, 60, 50); rect(348, 40, 18, 18, 3);
    fill(255); textSize(11); text("X", 357, 53);
};
var drawL9TresPanel = function() {
    var T = l9Tres; var i;
    if (T.panel === "ring") {
        drawL9TresPanelBox("THE RING LOCK", "click a ring to turn it. use the clues carved under it.");
        for (i = 0; i < 6; i++) {
            var rx = 55 + i * 58;
            fill(30, 20, 8); ellipse(rx, 112, 52, 52);
            fill(T.ring ? 200 : 150, T.ring ? 160 : 110, 50); ellipse(rx, 112, 46, 46);
            fill(70, 45, 15); ellipse(rx, 112, 38, 38);
            drawTresSym(T.rk[i], rx, 114, 1.5);
            fill(200, 180, 130); textSize(8); text("" + (i + 1), rx, 148);
        }
        fill(230, 215, 170); textSize(10); textAlign(LEFT);
        for (i = 0; i < T.clues.length; i++) { text("- " + tresClueText(T.clues[i]), 42, 172 + i * 17); }
        textAlign(CENTER); fill(200, 180, 130); textSize(8);
        text("(spot 1 is the LEFT end. every symbol is used once.)", 200, 330);
        if (T.ring) { fill(255, 230, 120); textSize(14); text("*CLICK* THE LOCK IS OPEN!", 200, 312); }
    } else if (T.panel === "box") {
        drawL9TresPanelBox("THE LOCKED BOX", "4 dials. each one has a picture on it...");
        fill(230, 215, 170); textSize(10);
        text("\"how many of these are lying around this room?\"", 200, 96);
        text("(not the ones on the altar.)", 200, 112);
        for (i = 0; i < 4; i++) {
            var bx = 95 + i * 70;
            fill(70, 45, 15); ellipse(bx, 150, 46, 46); drawTresSym(TRES_BOX_SYM[i], bx, 152, 1.4);
            fill(30, 30, 36); rect(bx - 22, 186, 44, 56, 6);
            fill(255, 230, 120); textSize(28); text("" + T.boxDial[i], bx, 226);
            fill(200); triangle(bx - 7, 182, bx + 7, 182, bx, 175); triangle(bx - 7, 246, bx + 7, 246, bx, 253);
        }
        fill(200, 60, 50); rect(166, 278, 68, 26, 5);
        fill(255); textSize(12); text("OPEN", 200, 296);
    } else if (T.panel === "towers") {
        drawL9TresPanelBox("THE HOARD", "stack the coins. every row + column: one stack of 1, 2, 3, 4 and 5.");
        fill(200, 180, 130); textSize(8);
        text("numbers = how many stacks you can SEE from that side (tall ones hide short ones)", 200, 80);
        var TX = 105; var TY = 100; var TS = 38;
        fill(30, 20, 8); rect(TX - 3, TY - 3, TS * 5 + 6, TS * 5 + 6, 4);
        for (i = 0; i < 25; i++) {
            var cx = TX + (i % 5) * TS; var cy = TY + floor(i / 5) * TS;
            fill(120, 84, 34); rect(cx + 1, cy + 1, TS - 2, TS - 2, 3);
            fill(135, 96, 40); rect(cx + 1, cy + 1, TS - 2, 5, 3);
            for (var h = 0; h < T.tw[i]; h++) { tresCoin(cx + TS / 2, cy + TS - 8 - h * 5, 17); }
            if (T.tw[i] > 0) { fill(255, 255, 255); textSize(9); text("" + T.tw[i], cx + TS - 6, cy + 11); }
        }
        textSize(14);
        for (var k = 0; k < 20; k++) {
            if (T.tClue[k] === 0) { continue; }
            var px; var py;
            if (k < 5) { px = TX + k * TS + TS / 2; py = TY - 9; }
            else if (k < 10) { px = TX + (k - 5) * TS + TS / 2; py = TY + TS * 5 + 19; }
            else if (k < 15) { px = TX - 16; py = TY + (k - 10) * TS + TS / 2 + 5; }
            else { px = TX + TS * 5 + 16; py = TY + (k - 15) * TS + TS / 2 + 5; }
            fill(255, 220, 110); text("" + T.tClue[k], px, py);
        }
        fill(200, 180, 130); textSize(8); text("click a spot to add a coin (6 clicks = empty again)", 200, 338);
        if (T.towers) { fill(255, 230, 120); textSize(14); text("THE PERFECT HOARD!", 200, 326); }
    } else if (T.panel === "beam") {
        drawL9TresPanelBox("THE SUN WELL", "click mirrors to flip them. the light must hit ALL 4 gems, then the crystal.");
        var B = T.bm; var N = TB_N; var S = TB_S;
        fill(30, 20, 8); rect(TB_X - 3, TB_Y - 3, S * N + 6, S * N + 6, 3);
        for (i = 0; i < N * N; i++) {
            var gx = TB_X + (i % N) * S; var gy = TB_Y + floor(i / N) * S;
            var C = B.cells[i];
            fill(70, 50, 22); rect(gx + 1, gy + 1, S - 2, S - 2, 2);
            if (C.k === 1) {
                stroke(120, 90, 40); strokeWeight(7);
                if (C.o === 0) { line(gx + 7, gy + S - 7, gx + S - 7, gy + 7); } else { line(gx + 7, gy + 7, gx + S - 7, gy + S - 7); }
                stroke(210, 230, 245); strokeWeight(3.5);
                if (C.o === 0) { line(gx + 7, gy + S - 7, gx + S - 7, gy + 7); } else { line(gx + 7, gy + 7, gx + S - 7, gy + S - 7); }
                noStroke();
            } else if (C.k === 2) {
                fill(90, 86, 80); ellipse(gx + S / 2, gy + S / 2, S - 10, S - 14);
                fill(120, 116, 108); ellipse(gx + S / 2 - 4, gy + S / 2 - 4, S - 26, S - 28);
            } else if (C.k === 3) {
                tresGem(gx + S / 2, gy + S / 2, 18, 230, 40, 70);
            }
        }
        // the sun (left) and the crystal (below)
        var sy = TB_Y + B.r0 * S + S / 2;
        fill(255, 220, 80); ellipse(TB_X - 22, sy, 26, 26);
        fill(255, 245, 180); ellipse(TB_X - 22, sy, 14, 14);
        var cxx = TB_X + B.ex * S + S / 2;
        fill(B.ok ? 255 : 150, B.ok ? 245 : 150, B.ok ? 190 : 165);
        quad(cxx, TB_Y + N * S + 6, cxx + 9, TB_Y + N * S + 18, cxx, TB_Y + N * S + 32, cxx - 9, TB_Y + N * S + 18);
        // the light
        stroke(255, 230, 120, 200); strokeWeight(4);
        for (i = 0; i + 1 < B.pts.length; i++) { line(B.pts[i][0], B.pts[i][1], B.pts[i + 1][0], B.pts[i + 1][1]); }
        stroke(255, 255, 230); strokeWeight(1.5);
        for (i = 0; i + 1 < B.pts.length; i++) { line(B.pts[i][0], B.pts[i][1], B.pts[i + 1][0], B.pts[i + 1][1]); }
        noStroke();
        fill(200, 180, 130); textSize(9); text("gems lit: " + B.hit + " / 4", 345, 200);
        if (T.lit) { fill(255, 230, 120); textSize(14); text("THE CRYSTAL IS LIT!", 200, 336); }
    }
};
var drawL9TresRoom = function() {
    tresGenerate();
    var T = l9Tres;
    drawL9TresBg();
    noStroke();
    // the 3 big treasure piles (one has the duster in it)
    for (var p = 0; p < 3; p++) {
        var P = TRES_PILES[p];
        fill(190, 140, 35); ellipse(P[0], P[1] + 12, 70, 34);
        fill(240, 195, 65); ellipse(P[0], P[1] + 4, 60, 34);
        fill(250, 215, 100); ellipse(P[0], P[1] - 6, 40, 22);
        tresCoin(P[0] - 14, P[1] - 2, 9); tresCoin(P[0] + 12, P[1] + 4, 9); tresCoin(P[0], P[1] - 12, 8);
        if (T.pile[p]) { fill(120, 80, 20); ellipse(P[0], P[1] - 2, 24, 10); }
    }
    // cups, gems, swords + crowns lying around
    for (var it = 0; it < T.items.length; it++) {
        var I = T.items[it];
        fill(0, 0, 0, 50); ellipse(I[1], I[2] + 9, 16, 4);
        drawTresSym(I[0], I[1], I[2], 0.85);
    }
    // the locked box (from the X pile)
    if (T.box && !T.boxOpen) {
        var BP = TRES_PILES[T.dPile];
        fill(90, 56, 26); rect(BP[0] - 16, BP[1] - 18, 32, 22, 3);
        fill(200, 160, 60); rect(BP[0] - 16, BP[1] - 12, 32, 3); rect(BP[0] - 3, BP[1] - 18, 6, 22);
        fill(60, 60, 66); rect(BP[0] - 6, BP[1] - 8, 12, 9, 2);
        fill(255, 240, 160, 120 + sin(frameCount * 8) * 100); textSize(7); textAlign(CENTER); text("LOCKED", BP[0], BP[1] - 22);
    }
    // the hoard table (coin towers)
    fill(110, 70, 30); rect(34, 252, 6, 42); rect(116, 252, 6, 42);
    fill(140, 92, 40); rect(28, 240, 100, 14, 3);
    fill(170, 115, 50); rect(28, 240, 100, 4, 3);
    for (var tc = 0; tc < 4; tc++) {
        var st = T.towers ? 4 - tc : (tc + 1);
        for (var ch = 0; ch < st; ch++) { tresCoin(46 + tc * 22, 236 - ch * 5, 14); }
    }
    fill(255, 240, 200); textSize(7); textAlign(CENTER); text(T.towers ? "PERFECT!" : "THE HOARD", 78, 268);
    // the SUN WELL on the right wall
    fill(90, 60, 20); rect(292, 56, 80, 82, 4);
    fill(255, 240, 170, 60 + sin(frameCount * 3) * 30); rect(298, 62, 68, 70, 2);
    stroke(70, 45, 15); strokeWeight(2);
    for (var mw = 0; mw < 3; mw++) { line(304 + mw * 22, 72, 316 + mw * 22, 84); line(316 + mw * 22, 104, 304 + mw * 22, 116); }
    noStroke();
    fill(255, 240, 200); textSize(7); text("SUN WELL", 332, 150);
    // the sunbeam to the crystal
    if (T.lit) {
        stroke(255, 240, 150, 160 + sin(frameCount * 9) * 60); strokeWeight(5); line(296, 120, 249, 180);
        stroke(255, 255, 230); strokeWeight(2); line(296, 120, 249, 180); noStroke();
    }
    // the altar
    drawTresAltar(200, 344, T);
    // Tres evolving on the altar
    if (T.evo === 1) {
        T.evoT++;
        var e = T.evoT;
        var sh = e < 160 ? e / 30 : 0;
        for (var sw = 0; sw < 14; sw++) {
            var sa = sw * 26 + e * 6;
            var rr = max(10, 90 - e * 0.5);
            tresCoin(200 + cos(sa) * rr, 230 + sin(sa) * rr * 0.6, 10);
        }
        fill(255, 240, 160, min(200, e * 1.5)); ellipse(200, 228, 60 + e * 0.6, 60 + e * 0.6);
        if (e < 160) { drawTres(200 + random(-sh, sh), 228 + random(-sh, sh), 0.6, 0); }
        else { drawTres(200, 214, 0.75, 1); }
        if (e === 60) { l9Say("the altar is pouring its treasure INTO Tres...", 200, 50); shake(3); }
        if (e === 160) { flash(255, 255, 230, 255); shake(12); burst(200, 228, 255, 220, 100, 60, 5, 0); }
        if (e === 170) { l9Say("TRES EVOLVED!!  (click him)", 200, 50); }
        if (e >= 200) { T.evo = 2; }
    } else if (T.evo === 2) {
        drawTres(200, 214 + sin(frameCount * 3) * 3, 0.75, 1);
    }
    // the way back
    fill(255, 255, 255, 140); textSize(18); textAlign(CENTER); text("<", 12, 206);
    // a puzzle up close
    if (T.panel !== "") { drawL9TresPanel(); }
};
// clicks for Tres stuff. returns true if it used the click
var l9TresPressed = function() {
    var T = l9Tres; var i;
    if (l9Scene === 3) {
        if (T.back && T.backT >= 90 && mouseX > 130 && mouseX < 270 && mouseY > 40 && mouseY < 170) { l9Scene = 7; return true; }
        if (T.onStage && dist(mouseX, mouseY, T.sx, T.sy) < 30) { l9Say("TRES is ready for his big show. (he looks... HUNGRY?)", T.sx, T.sy - 50); return true; }
        return false;
    }
    if (l9Scene !== 7) { return false; }
    // a puzzle is open
    if (T.panel !== "") {
        if (mouseX < 22 || mouseX > 378 || mouseY < 30 || mouseY > 352 || (mouseX > 346 && mouseY < 60)) { T.panel = ""; return true; }
        if (T.panel === "box" && !T.boxOpen) {
            for (i = 0; i < 4; i++) {
                var bxx = 95 + i * 70;
                if (abs(mouseX - bxx) < 24 && mouseY > 170 && mouseY < 256) {
                    if (mouseY < 214) { T.boxDial[i] = (T.boxDial[i] + 1) % 10; } else { T.boxDial[i] = (T.boxDial[i] + 9) % 10; }
                    return true;
                }
            }
            if (mouseX > 166 && mouseX < 234 && mouseY > 278 && mouseY < 304) {
                if (T.boxDial[0] === T.cnt[0] && T.boxDial[1] === T.cnt[1] && T.boxDial[2] === T.cnt[2] && T.boxDial[3] === T.cnt[3]) {
                    T.boxOpen = 1; T.panel = ""; l9Inv.push("duster"); flash(255, 230, 140, 90); shake(3);
                    l9Say("*click* the box opens! there's a FEATHER DUSTER inside!", 200, 360);
                } else { shake(3); l9Say("*clunk* wrong. count again!", 200, 360); }
                return true;
            }
            return true;
        }
        if (T.panel === "ring" && !T.ring) {
            for (i = 0; i < 6; i++) {
                if (dist(mouseX, mouseY, 55 + i * 58, 112) < 26) {
                    T.rk[i] = (T.rk[i] + 1) % 6;
                    var good = true;
                    for (var q = 0; q < 6; q++) { if (T.rk[q] !== T.ans[q]) { good = false; } }
                    if (good) { T.ring = 1; flash(255, 230, 140, 90); shake(4); l9Say("the rings lock into place... the BOWL opens!", 200, 360); }
                    return true;
                }
            }
        } else if (T.panel === "towers" && !T.towers) {
            var c = floor((mouseX - 105) / 38); var r = floor((mouseY - 100) / 38);
            if (c >= 0 && r >= 0 && c < 5 && r < 5) {
                T.tw[r * 5 + c] = (T.tw[r * 5 + c] + 1) % 6;
                var same = true;
                for (var z = 0; z < 25; z++) { if (T.tw[z] !== T.tSol[z]) { same = false; } }
                if (same) {
                    T.towers = 1; T.hoard = 1; l9Inv.push("hoard");
                    flash(255, 230, 140, 90); shake(4);
                    l9Say("the coins SHINE... you got THE PERFECT HOARD!", 200, 360);
                }
                return true;
            }
        } else if (T.panel === "beam" && !T.lit) {
            var bc = floor((mouseX - TB_X) / TB_S); var br = floor((mouseY - TB_Y) / TB_S);
            if (bc >= 0 && br >= 0 && bc < TB_N && br < TB_N) {
                var C = T.bm.cells[br * TB_N + bc];
                if (C.k === 1) {
                    C.o = 1 - C.o; tresBeamRun();
                    if (T.bm.ok) { T.lit = 1; flash(255, 245, 190, 120); shake(4); l9Say("the sunlight hits the crystal! the altar GLOWS!", 200, 360); }
                } else if (C.k === 2) { l9Say("a rock. it blocks the light.", 200, 360); }
                else if (C.k === 3) { l9Say("a ruby. the light has to go THROUGH it.", 200, 360); }
                return true;
            }
        }
        return true;
    }
    if (mouseX < 28 && abs(mouseY - 200) < 34) { l9Scene = 3; return true; }
    // Tres, all evolved: take him
    if (T.evo === 2 && dist(mouseX, mouseY, 200, 214) < 40) {
        T.evo = 3; l9Inv.push("tres2");
        burst(200, 214, 255, 220, 100, 20, 2.5, 0);
        l9Say("\"i feel AMAZING.\" (evolved Tres hops in your bag)", 200, 360);
        return true;
    }
    if (T.evo === 1) { return true; }
    // the locked box
    if (T.box && !T.boxOpen && dist(mouseX, mouseY, TRES_PILES[T.dPile][0], TRES_PILES[T.dPile][1] - 8) < 22) { T.panel = "box"; return true; }
    // the treasure piles
    for (var p = 0; p < 3; p++) {
        if (dist(mouseX, mouseY, TRES_PILES[p][0], TRES_PILES[p][1]) < 30) {
            if (T.pile[p]) { l9Say("you already dug through this pile.", 200, 360); return true; }
            T.pile[p] = 1;
            burst(TRES_PILES[p][0], TRES_PILES[p][1], 255, 210, 80, 14, 2.5, 0.1);
            if (p === T.dPile) { T.box = 1; l9Say("you dig... and find a LOCKED BOX! (it has 4 dials with pictures)", 200, 360); }
            else { l9Say("you dig through the coins... just more coins. (the map knows)", 200, 360); }
            return true;
        }
    }
    // the map
    if (mouseX > 34 && mouseX < 104 && mouseY > 56 && mouseY < 108) { l9Say("an old treasure map. X marks the pile with the duster.", 200, 360); return true; }
    // the hoard table
    if (mouseX > 28 && mouseX < 128 && mouseY > 222 && mouseY < 296) {
        if (T.towers) { l9Say("the hoard is perfect now.", 200, 360); } else { T.panel = "towers"; }
        return true;
    }
    // the sun well
    if (mouseX > 290 && mouseX < 374 && mouseY > 54 && mouseY < 156) { T.panel = "beam"; return true; }
    // the altar
    if (mouseX > 134 && mouseX < 266 && mouseY > 160 && mouseY < 344) {
        if (T.dust > 0) { l9Say("the altar is covered in THICK dust. you can't see anything.", 200, 360); return true; }
        if (mouseY > 266 && mouseY < 304) { T.panel = "ring"; return true; }
        if (!T.ring) { l9Say("there's a lock on the front. 5 rings with treasure on them.", 200, 360); }
        else if (T.hoard < 2) { l9Say("an empty bowl. it says: ONLY A PERFECT HOARD.", 200, 360); }
        else if (!T.lit) { l9Say("the crystal on the altar is dark. it needs LIGHT.", 200, 360); }
        else if (T.evo === 0) { l9Say("the altar is READY. it hums. (put Tres on it!)", 200, 360); }
        return true;
    }
    return true;
};
// scrubbing the altar with the duster (just wiggle it around over the altar)
var l9TresScrub = function() {
    var T = l9Tres;
    if (l9Scene === 7 && l9Held.type === "duster" && T.dust > 0 && mouseX > 134 && mouseX < 266 && mouseY > 158 && mouseY < 344) {
        T.dust -= dist(mouseX, mouseY, T.lastX, T.lastY) * 0.12;
        if (frameCount % 4 === 0) { burst(mouseX, mouseY, 170, 165, 150, 2, 1.5, 0.05); }
        if (T.dust <= 0) {
            T.dust = 0; l9RemoveItem("duster"); l9Held = {type: "", x: 0, y: 0};
            flash(255, 240, 180, 80);
            l9Say("the altar is CLEAN! there's a lock on the front... and words.", 200, 360);
        }
    }
    T.lastX = mouseX; T.lastY = mouseY;
};
// dropping Tres things (returns true if it handled the item)
var l9TresDropped = function(h) {
    var T = l9Tres;
    if (h === "duster") {
        if (l9Scene === 7 && T.dust > 0) { l9Say("keep wiggling it around over the altar! (dust: " + (floor(T.dust) + 1) + "%)", 200, 360); }
        else { l9Say("a feather duster. *achoo*", 200, 340); }
        return true;
    }
    if (h === "hoard") {
        if (l9Scene === 7 && T.ring && mouseX > 150 && mouseX < 250 && mouseY > 220 && mouseY < 270) {
            l9RemoveItem("hoard"); T.hoard = 2;
            burst(200, 244, 255, 220, 100, 20, 2.5, 0.1);
            l9Say("*CLINK CLINK CLINK* the perfect hoard fills the bowl.", 200, 360);
        } else if (l9Scene === 7 && !T.ring) {
            l9Say("the bowl has a lid on it. (the lock on the front...)", 200, 360);
        } else {
            l9Say("THE PERFECT HOARD. it goes in a bowl.", 200, 340);
        }
        return true;
    }
    if (h === "tres") {
        if (l9Scene === 7 && mouseX > 134 && mouseX < 266 && mouseY > 150 && mouseY < 344) {
            if (tresReady()) {
                l9RemoveItem("tres"); T.evo = 1; T.evoT = 0;
                l9Say("Tres sits in the bowl... the altar starts to SHINE.", 200, 50);
            } else if (T.dust > 0) { l9Say("\"ew, DUST.\" (Tres won't sit there)", 200, 360); }
            else if (!T.ring) { l9Say("\"the bowl is closed.\" (Tres pouts)", 200, 360); }
            else if (T.hoard < 2) { l9Say("\"the bowl is empty.\" (Tres wants treasure in it)", 200, 360); }
            else { l9Say("\"it's too dark.\" (the crystal isn't lit)", 200, 360); }
        } else {
            l9Say("blorp. (Tres wants to go somewhere special)", 200, 340);
        }
        return true;
    }
    if (h === "tres2") {
        if (l9Scene === 3 && mouseX > 40 && mouseX < 340 && mouseY > 150 && mouseY < 336) {
            if (l9Rain.fishOn) { l9Say("the storm fish is hogging the stage!", 200, 150); return true; }
            l9RemoveItem("tres2");
            T.onStage = 1; T.sx = mouseX; T.sy = constrain(mouseY, 190, 280);
            burst(mouseX, T.sy, 255, 220, 100, 16, 2.5, 0);
            l9Say("TRES floats over the stage. he's licking his lips...?", 200, 150);
        } else {
            l9Say("evolved Tres wants to be on the STAGE.", 200, 340);
        }
        return true;
    }
    return false;
};
// pulled the curtain rope to the RIGHT
var l9TresRopeRight = function() {
    var T = l9Tres;
    if (T.back) { return; }
    if (!l9CastReady()) { l9Say("the rope swings sideways. nothing happens... yet.", 200, 200); return; }
    if (!l9HasItem("tres") && T.evo === 0) { l9Say("the BACK curtain twitches... something SHINY is back there. it won't open for you.", 200, 200); return; }
    T.back = 1; T.backT = 0;
    shake(6); flash(255, 230, 140, 90);
    l9Say("the BACK curtain slides open... a room FULL OF TREASURE!!", 200, 200);
};

var drawL9Stage = function() {
    noStroke();
    background(18, 10, 14);
    // back wall + light
    fill(40, 22, 28); rect(0, 0, 400, 260);
    fill(255, 240, 200, 16); triangle(200, -20, 30, 300, 370, 300);
    drawL9BackCurtain();
    // the THE END banner, hanging crooked
    stroke(170, 150, 110); strokeWeight(2);
    line(140, 0, 142, 44); line(262, 0, 258, 58);
    noStroke();
    pushMatrix(); translate(200, 52); rotate(7);
    fill(240, 225, 190); rect(-64, -12, 128, 26, 2);
    fill(150, 20, 30); textSize(18); textAlign(CENTER); text("THE END", 0, 8);
    popMatrix();
    // stage floor
    fill(110, 70, 40); rect(0, 250, 400, 84);
    fill(95, 60, 34);
    for (var fb = 250; fb < 334; fb += 12) { rect(0, fb, 400, 1); }
    fill(70, 42, 24); rect(0, 330, 400, 8);
    // footlights
    for (var fl = 0; fl < 9; fl++) {
        var fx = 30 + fl * 43;
        fill(255, 230, 140, 40); ellipse(fx, 330, 30, 16);
        fill(255, 230, 140); arc(fx, 333, 12, 10, 180, 360);
    }
    // wall outlet
    fill(230, 225, 210); rect(L9_OUTLET_X - 7, L9_OUTLET_Y - 9, 14, 18, 2);
    fill(60); rect(L9_OUTLET_X - 3, L9_OUTLET_Y - 5, 2, 4); rect(L9_OUTLET_X + 1, L9_OUTLET_Y - 5, 2, 4);
    // tape X marks (back row is a bit smaller)
    for (var m = 0; m < l9Marks.length; m++) {
        var sz = l9Marks[m].y < 290 ? 6 : 8;
        stroke(240, 230, 200, 200); strokeWeight(3);
        line(l9Marks[m].x - sz, l9Marks[m].y - 5, l9Marks[m].x + sz, l9Marks[m].y + 5);
        line(l9Marks[m].x + sz, l9Marks[m].y - 5, l9Marks[m].x - sz, l9Marks[m].y + 5);
        noStroke();
    }
    // the trapdoor (and whatever is under it)
    if (l9Beast.state === "under") {
        fill(80, 50, 28); rect(L9_TRAP_X - 28, L9_TRAP_Y - 5, 56, 11, 1);
        fill(95, 62, 36); rect(L9_TRAP_X - 26, L9_TRAP_Y - 4, 52, 2);
        fill(60, 38, 20); rect(L9_TRAP_X - 1, L9_TRAP_Y - 5, 2, 11);
        fill(160, 160, 165); rect(L9_TRAP_X + 18, L9_TRAP_Y - 1, 6, 3, 1);
        fill(250, 230, 80); rect(L9_TRAP_X - 22, L9_TRAP_Y - 3, 18, 7, 1);
        fill(170, 20, 20); textSize(3.4); textAlign(CENTER); text("DO NOT", L9_TRAP_X - 13, L9_TRAP_Y); text("FEED", L9_TRAP_X - 13, L9_TRAP_Y + 3.4);
        if (frameCount % 300 === 150) { l9Say("*growl*", L9_TRAP_X, 230); shake(1.5); }
    } else {
        fill(10, 5, 8); rect(L9_TRAP_X - 28, L9_TRAP_Y - 5, 56, 11, 1);
        fill(80, 50, 28); quad(L9_TRAP_X - 28, L9_TRAP_Y - 5, L9_TRAP_X - 28, L9_TRAP_Y - 30, L9_TRAP_X - 2, L9_TRAP_Y - 34, L9_TRAP_X - 2, L9_TRAP_Y - 5);
        var bk2 = 1;
        if (l9Beast.state === "rising") {
            l9Beast.t++;
            bk2 = min(1, l9Beast.t / 100);
            if (l9Beast.t % 10 === 0) { shake(2); }
            if (bk2 >= 1) { l9Beast.state = "up"; l9Say("ROOOAR!! (I love celery)", L9_TRAP_X, 140); }
        }
        fill(120, 40, 200, 40 * bk2); ellipse(L9_TRAP_X, 214, 130, 100);
        drawAltarBeast(L9_TRAP_X, 300 - 84 * bk2, 0.5, mouseX, mouseY, false);
        // the stage floor in front of it (so it rises out of the hole)
        fill(110, 70, 40); rect(L9_TRAP_X - 70, L9_TRAP_Y + 6, 140, 4);
    }
    // spilled snacks + the bird seed
    for (var sn = 0; sn < l9Snacks.length; sn++) {
        var S = l9Snacks[sn];
        if (S.y < S.ty) { S.vy += 0.5; S.x += S.vx; S.y = min(S.ty, S.y + S.vy); }
        l9DrawSnackBag(S.x, S.y, S.r, S.g, S.b, S.rot);
    }
    if (l9Seed.on) { drawL9Item("seed", l9Seed.x, l9Seed.y); }
    if (l9Celery.on) { drawL9Item("celery", l9Celery.x, l9Celery.y); }
    // the vending machine (before it joins the cast)
    if (l9Vend.hop < 2) {
        var vx = l9Vend.x; var vy = l9Vend.y;
        if (l9Vend.hop === 1) {
            l9Vend.hopT++;
            var tm = l9Marks[l9MarkWith("vend")];
            var hk = min(1, l9Vend.hopT / 90);
            vx = L9_VEND_X + (tm.x - L9_VEND_X) * hk;
            vy = L9_VEND_Y + (tm.y - 2 - L9_VEND_Y) * hk - abs(sin(hk * 540)) * 22;
            if (l9Vend.hopT % 30 === 15) { shake(2); }
            if (hk >= 1) { l9Vend.hop = 2; l9Say("*CLONK* the vending machine takes its place", tm.x, 150); }
        }
        var vshake = (l9Vend.dumped && l9Vend.dumpT < 60) ? random(-2, 2) : 0;
        // power cord
        stroke(30); strokeWeight(2); noFill();
        var px = l9Vend.plugged ? L9_OUTLET_X : l9Vend.plugX; var py = l9Vend.plugged ? L9_OUTLET_Y : l9Vend.plugY;
        if (l9Vend.hop === 0) { bezier(vx - 26, vy - 6, vx - 50, vy + 10, px + 20, py + 6, px, py); }
        noStroke();
        if (!l9Vend.plugged && l9Vend.hop === 0) { fill(50); rect(l9Vend.plugX - 5, l9Vend.plugY - 4, 10, 8, 2); fill(200); rect(l9Vend.plugX + 5, l9Vend.plugY - 3, 4, 2); rect(l9Vend.plugX + 5, l9Vend.plugY + 1, 4, 2); }
        l9DrawVending(vx + vshake, vy, 0.25);
        // its little display
        fill(20, 40, 25); rect(vx + 14, vy - 74, 13, 6);
        fill(110, 255, 140); textSize(3.5); textAlign(CENTER);
        text(l9Vend.plugged && l9Power ? (l9Vend.credit ? "25c" : "COIN") : "", vx + 20.5, vy - 69.5);
        if (!l9Vend.plugged || !l9Power) {
            fill(250, 240, 200); rect(vx - 22, vy - 60, 30, 12, 1);
            fill(180, 30, 30); textSize(6); text("ON BREAK", vx - 7, vy - 52);
        }
    }
    // the cast (whoever has shown up), back row first
    for (var row = 0; row < 2; row++) {
        for (var c = 0; c < l9Marks.length; c++) {
            var back = l9Marks[c].y < 290;
            if ((row === 0) !== back) { continue; }
            var it = l9Marks[c].item; var mx = l9Marks[c].x; var my = l9Marks[c].y;
            var ss = back ? 0.85 : 1;
            pushMatrix(); translate(mx, my); scale(ss);
            if (it === "costume") { l9DrawWerewolf(0, -92, 0.4, true); }
            else if (it === "plush") { l9DrawMonster(0, -22, 1.3); }
            else if (it === "duck") { l9DrawDuck(-4, -12, l9Squeak.t >= 0 && l9Squeak.onStage ? 0.85 : 1); }
            else if (it === "fox") { drawFoxDetailed(-8, -20, false); }
            else if (it === "vend" && l9Vend.hop === 2) { l9DrawVending(0, 2, 0.2); }
            else if (it === "bird" && l9Bird.state === "landed") { drawSongbird(0, -10, 1.2, 180, 120, 60, 0, false); }
            popMatrix();
        }
    }
    if (l9RexStage.on) {
        var rm = l9Marks[l9RexStage.mark];
        if (l9RexStage.x < rm.x) { l9RexStage.x = min(rm.x, l9RexStage.x + 3); }
        l9DrawRex(l9RexStage.x - 6, rm.y - 18, l9RexStage.x < rm.x ? "walking" : "awake", 1);
    }
    // the bird: up in the rafters, or flying down to its seed
    if (l9Bird.state === "rafters") {
        stroke(90, 70, 50); strokeWeight(3); line(110, 30, 190, 30); noStroke();
        drawSongbird(150, 22, 1, 180, 120, 60, 0, false);
        if (frameCount % 200 === 100) { l9Say("tweet!", 150, 50); }
    } else if (l9Bird.state === "flying") {
        l9Bird.t++;
        var bk = min(1, l9Bird.t / 70);
        var bm = l9Marks[l9Bird.mark];
        drawSongbird(150 + (bm.x - 150) * bk, 22 + (bm.y - 10 - 22) * bk - sin(bk * 180) * 30, 1.2, 180, 120, 60, 0, false);
        if (bk >= 1) { l9Bird.state = "landed"; l9Say("the bird lands on its X. (tweet)", bm.x, 150); }
    }
    // curtains at the sides
    fill(150, 20, 30); rect(0, 0, 34, 334); rect(366, 0, 34, 334);
    fill(120, 10, 20);
    for (var cf = 0; cf < 4; cf++) { rect(6 + cf * 7, 0, 2, 334); rect(370 + cf * 7, 0, 2, 334); }
    fill(110, 10, 20); rect(0, 0, 400, 16);
    // the curtain rope (right side)
    var ry = 236 + l9Rope.y; var rpx = 352 + l9Rope.x;
    stroke(220, 190, 90); strokeWeight(3); line(352, 0, rpx, ry); noStroke();
    fill(230, 190, 60); ellipse(rpx, ry + 6, 12, 14);
    fill(200, 150, 40); rect(rpx - 5, ry + 10, 10, 10, 2);
    fill(255, 240, 200, 160); textSize(6); textAlign(CENTER); text("CURTAIN", rpx, ry + 30);
    // director's chair + clipboard
    fill(60, 40, 25); rect(44, 262, 4, 54); rect(84, 262, 4, 54);
    fill(30, 30, 34); rect(42, 240, 48, 18, 2);
    fill(255); textSize(7); text("DIRECTOR", 66, 252);
    fill(30, 30, 34); rect(42, 280, 48, 8, 2);
    fill(150, 110, 60); rect(54, 266, 22, 16, 1);
    fill(250); rect(56, 270, 18, 11);
    fill(120, 120, 130); rect(60, 264, 10, 4, 1);
    // the audience, waiting...
    fill(8, 5, 8); rect(0, 338, 400, 62);
    for (var a = 0; a < 13; a++) {
        var ax = 14 + a * 31; var ay = 362 + (a % 2) * 10;
        fill(22, 16, 22); ellipse(ax, ay, 26, 28); rect(ax - 15, ay + 10, 30, 30, 8);
    }
    l9Cough++;
    if (l9Cough % 400 === 200) { l9Say("*cough*", 100 + (l9Cough % 7) * 30, 350); }
    // curtain rising at the start
    if (l9CurtainT < 70) {
        l9CurtainT++;
        var up = l9CurtainT / 70;
        fill(150, 20, 30); rect(0, -334 * up, 400, 334);
        fill(120, 10, 20);
        for (var cr = 0; cr < 20; cr++) { rect(cr * 20 + 8, -334 * up, 3, 334); }
    }
    fill(255, 255, 255, 120); textSize(18); textAlign(CENTER); text("<", 14, 150);
    // the cast list
    if (l9Clip) {
        fill(0, 0, 0, 150); rect(0, 0, 400, 400);
        fill(150, 110, 60); rect(110, 60, 180, 250, 6);
        fill(250, 248, 240); rect(120, 76, 160, 226, 2);
        fill(140, 140, 150); rect(180, 54, 40, 14, 3);
        fill(30); textSize(15); textAlign(CENTER); text("CAST LIST", 200, 104);
        textSize(10); textAlign(LEFT);
        var names = ["THE WEREWOLF", "THE PURPLE MONSTER", "THE FOX", "THE BIRD", "THE RUBBER DUCK", "THE VENDING MACHINE", "REX (very good boy)", "THE ALTAR BEAST"];
        var have = [l9MarkWith("costume") >= 0, l9MarkWith("plush") >= 0, l9MarkWith("fox") >= 0, l9Bird.state === "landed",
                    l9MarkWith("duck") >= 0, l9Vend.hop === 2, l9RexStage.on, l9Beast.state === "up"];
        for (var n = 0; n < 8; n++) {
            var ny = 114 + n * 19;
            stroke(60); strokeWeight(1); noFill(); rect(134, ny, 10, 10);
            noStroke();
            if (have[n]) { stroke(30, 140, 50); strokeWeight(2.2); line(136, ny + 5, 139, ny + 9); line(139, ny + 9, 145, ny - 1); noStroke(); }
            fill(40); textSize(9); text(names[n], 152, ny + 9);
        }
        fill(120); textSize(8); textAlign(CENTER);
        text("everyone in their places.", 200, 277);
        text("then: CLOSE THE CURTAIN.", 200, 287);
        text("(click to put it down)", 200, 297);
    }
};

// ---------- THE ENCORE: the super hard way to LEVEL 10 ----------
// 1) click "(for real)" until it gives up  2) the cast must bow in REVERSE credits order
// 3) the hatch code = the BUDGET (25 cents) x the cast on stage (9) = 225
var L9_ENCORE_ORDER = [7, 6, 5, 8, 4, 3, 2, 1, 0];
var drawL9Encore = function() {
    var E = l9Encore;
    if (E.stage === 0) { return; }
    E.t++;
    noStroke();
    // the gold sign lowers down
    var sy = min(10, -70 + E.t * 2);
    stroke(200, 170, 80); strokeWeight(2); line(110, 0, 110, sy); line(290, 0, 290, sy); noStroke();
    fill(120, 90, 20); rect(68, sy + 2, 264, 52, 5);
    fill(230, 190, 70); rect(66, sy, 264, 52, 5);
    fill(250, 220, 120); rect(70, sy + 3, 256, 6, 3);
    fill(60, 30, 10); textSize(14); textAlign(CENTER); text("LEVEL 10: CAST ONLY.", 198, sy + 24);
    textSize(10); text("the LAST one in the credits bows FIRST.", 198, sy + 42);
    if (E.stage === 1 && E.t < 200 && E.t % 40 < 30) {
        fill(255, 255, 255, 160); textSize(13);
        text("ENCORE!", 70 + (E.t * 3) % 260, 330 + sin(E.t * 8) * 4);
    }
    // the hatch in the stage (bottom-left corner)
    if (E.stage >= 2) {
        fill(60, 40, 22); rect(12, 306, 88, 88, 5);
        if (E.stage === 2) {
            fill(90, 62, 36); rect(16, 310, 80, 80, 4);
            fill(240, 228, 195); textSize(7); textAlign(CENTER);
            text("CODE = THE BUDGET", 56, 321); text("(in cents) x THE CAST", 56, 330); text("ON STAGE", 56, 339);
            for (var d = 0; d < 3; d++) {
                fill(30, 26, 24); rect(28 + d * 20, 343, 16, 22, 3);
                fill(240, 230, 200); textSize(14); text(E.dial[d], 36 + d * 20, 360);
            }
            fill(200, 60, 50); rect(30, 369, 52, 16, 3);
            fill(255); textSize(8); text("OPEN", 56, 380);
        } else {
            E.open++;
            fill(255, 240, 160, 120 + sin(frameCount * 6) * 60); rect(16, 310, 80, 80, 4);
            fill(255, 255, 220, 60); ellipse(56, 350, 130 + sin(frameCount * 4) * 10, 100);
            var ly = 360 - min(30, E.open);
            fill(30, 20, 40); rect(26, ly - 16, 60, 22, 4);
            fill(255, 225, 60); textSize(12); text("LEVEL 10", 56, ly);
        }
    }
};
// a cast member just bowed (c = 0..8)
var l9EncoreBow = function(c) {
    var E = l9Encore;
    if (E.stage !== 1) { return; }
    if (c === L9_ENCORE_ORDER[E.seq]) {
        E.seq++;
        burst(200, 200, 255, 230, 120, 4, 1.5, 0);
        if (E.seq >= 9) {
            E.stage = 2;
            shake(8); flash(255, 240, 200, 120);
            l9Say("*THUNDEROUS APPLAUSE* ...a hatch pops open in the stage!", 200, 190);
        }
    } else {
        E.seq = 0;
        shake(4);
        l9Say("BOOOOO! (the audience didn't like that. start over.)", 200, 190);
    }
};
var l9EncorePressed = function() {
    var E = l9Encore;
    if (E.stage === 0 && l9T > 140 && abs(mouseX - 200) < 60 && abs(mouseY - 135) < 12) {
        E.clicks++;
        if (E.clicks >= 3) {
            E.stage = 1; E.t = 0;
            l9Say("the audience starts chanting: ENCORE! ENCORE! ENCORE!", 200, 190);
        }
        return true;
    }
    if (E.stage === 2) {
        for (var d = 0; d < 3; d++) {
            if (mouseX > 28 + d * 20 && mouseX < 44 + d * 20 && mouseY > 343 && mouseY < 365) {
                E.dial[d] = (E.dial[d] + 1) % 10;
                return true;
            }
        }
        if (mouseX > 30 && mouseX < 82 && mouseY > 369 && mouseY < 385) {
            if (E.dial[0] === 2 && E.dial[1] === 2 && E.dial[2] === 5) {
                E.stage = 3; E.open = 0;
                shake(10); flash(255, 245, 200, 200);
                l9Say("*KA-CHUNK* the hatch swings open...", 200, 190);
            } else {
                shake(3);
                l9Say("*clunk* wrong code. (the hatch stays shut)", 200, 190);
            }
            return true;
        }
    }
    if (E.stage === 3 && E.open > 30 && mouseX > 10 && mouseX < 102 && mouseY > 300 && mouseY < 396) {
        level = 10;
        return true;
    }
    return false;
};
var drawL9CurtainCall = function() {
    l9T++;
    noStroke();
    background(20, 12, 16);
    fill(100, 60, 35); rect(0, 300, 400, 100);
    fill(255, 240, 200, 30); ellipse(200, 300, 420, 90);
    fill(255, 250, 220, 14); triangle(200, -20, 20, 320, 380, 320);
    // the Altar Beast looms at the back for the big finale
    var bBow = 0;
    var bWave = (l9T - 140 - 8 * 12) % 260;
    if (l9T > 140 && bWave >= 0 && bWave < 40) { bBow = sin(bWave * 4.5) * 8; }
    if (l9Bows[8] > 0) { l9Bows[8]--; bBow = sin(l9Bows[8] * 12) * 10; }
    fill(120, 40, 200, 40); ellipse(200, 236, 150, 120);
    drawAltarBeast(200, 232 + abs(bBow), 0.62, mouseX, mouseY, false);
    // the cast takes a bow, one after another
    var xs = [28, 74, 122, 166, 206, 248, 300, 360];
    for (var i = 0; i < 8; i++) {
        var cx = xs[i]; var cy = 296;
        var bow = 0;
        var wave = (l9T - 140 - i * 12) % 260;
        if (l9T > 140 && wave >= 0 && wave < 30) { bow = sin(wave * 6) * 10; }
        if (l9Bows[i] > 0) { l9Bows[i]--; bow = sin(l9Bows[i] * 12) * 12; }
        pushMatrix(); translate(cx, cy + abs(bow) * 0.4); rotate(bow * 1.5);
        if (i === 0) { l9DrawWerewolf(0, -78, 0.4, false); }
        else if (i === 1) { l9DrawMonster(0, -26, 1.3); }
        else if (i === 2) { l9DrawFox(-4, -18); }
        else if (i === 3) { l9DrawBird(0, -30); }
        else if (i === 4) { l9DrawEyeball(0, -26); }
        else if (i === 5) { l9DrawDuck(-4, -12, 1); }
        else if (i === 6) { l9DrawVending(0, 0, 0.2); }
        else { l9DrawRex(-6, -18, "awake", 1); }
        popMatrix();
    }
    textAlign(CENTER);
    if (l9T > 90) {
        fill(255); textSize(48); text("THE END", 200, 112);
        var reals = ["(for real)", "(for real?)", "(...probably?)", "(ok FINE.)"];
        fill(200); textSize(16); text(reals[min(3, l9Encore.clicks)], 200, 140);
    }
    if (l9T > 220) { fill(255, 220, 120); textSize(13); text("(no, really this time)", 200, 164); }
    if (l9T > 320) {
        fill(255, 255, 255, min(255, (l9T - 320) * 4)); textSize(18); text("Thanks for playing!", 200, 344);
        fill(180, 180, 190, min(255, (l9T - 320) * 4)); textSize(11); text("a game by Toadjames", 200, 366);
    }
    if (l9T > 90 && l9T % 25 === 0) {
        burst(random(40, 360), random(40, 200), floor(random(100, 255)), floor(random(100, 255)), floor(random(100, 255)), 18, 3, 0.08);
    }
    var cl = 0;
    if (l9T < 50) { cl = l9T / 50; } else if (l9T < 80) { cl = 1; } else if (l9T < 140) { cl = 1 - (l9T - 80) / 60; }
    fill(150, 20, 30);
    rect(0, 0, 200 * cl, 400); rect(400 - 200 * cl, 0, 200 * cl, 400);
    fill(120, 10, 20);
    for (var f = 0; f < 5; f++) {
        rect(200 * cl - 40 + f * 8, 0, 3, 400 * min(1, cl * 2));
        rect(400 - 200 * cl + 10 + f * 8, 0, 3, 400 * min(1, cl * 2));
    }
    fill(110, 10, 20); rect(0, 0, 400, 24);
    drawL9Encore();
    drawL9Says();
};

var drawL9Keypad = function() {
    noStroke();
    fill(0, 0, 0, 160); rect(0, 0, 400, 400);
    fill(60, 62, 70); rect(130, 96, 140, 214, 8);
    fill(25, 35, 25); rect(144, 108, 112, 30, 4);
    textAlign(CENTER);
    if (l9Keypad.msgT > 0) {
        l9Keypad.msgT--;
        if (l9Keypad.msg === "OPEN") { fill(120, 255, 140); } else { fill(255, 90, 90); }
        textSize(16); text(l9Keypad.msg, 200, 130);
    } else {
        fill(120, 255, 140); textSize(18);
        var shown = l9Keypad.entry;
        while (shown.length < 3) { shown += "_"; }
        text(shown.split("").join(" "), 200, 131);
    }
    var labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"];
    for (var i = 0; i < 12; i++) {
        var bx = 146 + (i % 3) * 38; var by = 148 + floor(i / 3) * 36;
        fill(150, 155, 168); rect(bx, by, 32, 28, 4);
        fill(30); textSize(labels[i].length > 1 ? 10 : 14); text(labels[i], bx + 16, by + 19);
    }
    fill(200); textSize(8); text("STAFF ONLY  -  click outside to close", 200, 304);
};

var drawL9VendPad = function() {
    noStroke();
    fill(0, 0, 0, 150); rect(0, 0, 400, 400);
    fill(185, 32, 44); rect(120, 90, 160, 220, 8);
    fill(255, 240, 200); textSize(12); textAlign(CENTER); text("SNAX", 200, 108);
    fill(20, 40, 25); rect(136, 116, 128, 26, 3);
    fill(110, 255, 140); textSize(10);
    var shown = l9Vend.msg;
    if (l9Vend.entry !== "") { shown = l9Vend.entry + "_"; }
    text(shown, 200, 133);
    var keys = ["A", "B", "C", "D", "1", "2", "3", "4"];
    for (var b = 0; b < 8; b++) {
        var bx = b < 4 ? 150 : 210; var by = 152 + (b % 4) * 32;
        fill(210, 210, 215); rect(bx, by, 40, 26, 4);
        fill(30); textSize(13); text(keys[b], bx + 20, by + 18);
    }
    fill(255, 230, 200); textSize(8); text("click outside to close", 200, 302);
};

// ---------- THE RAIN SECRET (you need the RAIN KEY from the secret route) ----------
var L9_RDOOR_X = 20;
var L9_RDOOR_Y = 300;
var L9_CHAIN_X = 92;
var L9_CHAIN_Y = 150;
var L9_ALTAR_X = 200;
var L9_ALTAR_Y = 318;
var l9InRainDoor = function(x, y) {
    return x > L9_RDOOR_X - 8 && x < L9_RDOOR_X + 36 && y > L9_RDOOR_Y - 8 && y < L9_RDOOR_Y + 56;
};
var drawL9RainDoor = function() {
    var x = L9_RDOOR_X; var y = L9_RDOOR_Y;
    if (!l9Rain.door) {
        noFill(); stroke(24, 28, 38); strokeWeight(1); rect(x, y, 28, 48);
        noStroke(); fill(26, 32, 46);
        ellipse(x + 14, y + 26, 9, 9); triangle(x + 9.6, y + 24.5, x + 18.4, y + 24.5, x + 14, y + 15);
        fill(24, 26, 34); ellipse(x + 23, y + 30, 3, 3);
    } else {
        noStroke();
        fill(120, 200, 255, 40 + 20 * sin(frameCount * 4)); rect(x - 6, y - 6, 40, 60, 4);
        fill(150, 205, 250); rect(x, y, 28, 48);
        for (var i = 0; i < 4; i++) {
            fill(70, 130, 220, 160);
            rect(x + 3 + i * 7, y + (frameCount * 2 + i * 13) % 42 + 2, 1.5, 5);
        }
        fill(30, 50, 80); quad(x + 28, y, x + 38, y - 4, x + 38, y + 52, x + 28, y + 48);
        fill(120, 200, 255); ellipse(x + 34, y + 26, 4, 4);
    }
};
// behind the rain door: the rain guppy's room
var drawL9GuppyRoom = function() {
    noStroke();
    background(14, 22, 40);
    for (var i = 0; i < 45; i++) {
        var rx = (i * 53) % 400; var ry = (i * 97 + frameCount * 5) % 330;
        fill(100, 160, 240, 50); rect(rx, ry, 1.5, 11);
    }
    fill(22, 34, 58); rect(0, 300, 400, 100);
    fill(40, 70, 120, 140); ellipse(200, 316, 280, 30);
    if (!l9Rain.puddleGem) {
        fill(20, 40, 80, 160); ellipse(262, 320, 30, 9);
        drawRainGem(262, 318, 0.7);
        fill(40, 80, 150, 110); ellipse(262, 318, 26, 10);
        if (frameCount % 60 < 6) { fill(255, 255, 255, 200); ellipse(258, 314, 3, 3); }
    }
    fill(70, 120, 190, 90); ellipse(200 + sin(frameCount * 2) * 40, 316, 40, 6);
    // the tiny rain cloud on the ceiling
    fill(90, 100, 125); ellipse(200, 40, 70, 34); ellipse(175, 46, 40, 26); ellipse(226, 46, 44, 26);
    fill(120, 130, 155); ellipse(192, 34, 34, 20);
    // the sign
    fill(60, 45, 30); rect(132, 92, 136, 30, 3);
    fill(230, 220, 190); textSize(9); textAlign(CENTER);
    text("RAIN GUPPY'S HOUSE", 200, 105); text("population: 1", 200, 117);
    if (!l9Rain.guppy) {
        var gy = 200 + sin(frameCount * 2) * 8;
        fill(120, 200, 255, 30); ellipse(200, gy, 120, 120);
        drawRainGuppy(200, gy, 2.4);
        if (frameCount % 50 === 0) { burst(200 + random(-20, 20), gy - 30, 170, 225, 255, 3, 1, -0.02); }
    } else {
        fill(160, 190, 230); textSize(11); text("(the guppy's raindrop is in your bag now)", 200, 210);
    }
    fill(255, 255, 255, 120); textSize(18); textAlign(CENTER); text(">", 386, 206);
};
// up through the hole in the ceiling: the attic
var drawL9Attic = function() {
    noStroke();
    background(46, 34, 26);
    // slanted roof + beams
    fill(36, 26, 20); triangle(0, 0, 0, 170, 150, 0); triangle(400, 0, 400, 170, 250, 0);
    fill(70, 50, 34);
    rect(0, 168, 400, 10); rect(60, 0, 10, 300); rect(330, 0, 10, 300);
    fill(56, 40, 28); for (var nb = 0; nb < 5; nb++) { rect(0, 186 + nb * 22, 60, 2); rect(340, 186 + nb * 22, 60, 2); }
    // cobwebs
    stroke(200, 200, 210, 70); strokeWeight(1); noFill();
    line(70, 0, 110, 0); line(70, 0, 70, 40); line(70, 0, 100, 30);
    arc(70, 0, 30, 30, 0, 90); arc(70, 0, 52, 52, 0, 90);
    noStroke();
    // the skylight
    fill(20, 26, 50); rect(160, 14, 80, 46, 2);
    if (l9Rain.sky) {
        fill(40, 50, 80); rect(160, 14, 80, 46, 2);
        fill(150, 190, 230, 60); quad(160, 14, 240, 14, 250, -6, 150, -6);
        fill(200, 210, 230, 150); ellipse(222, 26, 10, 10);
        stroke(140, 190, 255, 170); strokeWeight(1.5);
        for (var dr = 0; dr < 26; dr++) {
            var rx = 166 + (dr * 29) % 68; var ry = 60 + (frameCount * 9 + dr * 37) % 240;
            line(rx, ry, rx - 1, ry + 10);
        }
        noStroke();
        fill(70, 130, 210, 120); ellipse(200, 302, 90, 10);
    } else {
        fill(70, 50, 34); rect(198, 14, 4, 46); rect(160, 35, 80, 4);
        fill(200, 210, 230, 160); ellipse(222, 26, 10, 10);
        fill(170, 150, 80); rect(194, 54, 12, 5, 1);
    }
    noFill(); stroke(70, 50, 34); strokeWeight(4); rect(160, 14, 80, 46, 2); noStroke();
    // the floor
    fill(78, 56, 38); rect(0, 300, 400, 100);
    stroke(60, 42, 28); strokeWeight(1);
    for (var p = 0; p < 6; p++) { line(0, 310 + p * 15, 400, 310 + p * 15); }
    noStroke();
    // old junk: a trunk, a cardboard sun, the box of OLD LEVELS
    fill(90, 60, 35); rect(286, 254, 76, 48, 3);
    if (!l9Rain.trunk) {
        fill(110, 76, 45); rect(286, 254, 76, 12, 3);
        fill(60, 50, 40); rect(296, 274, 56, 18, 3);
        for (var lk = 0; lk < 3; lk++) {
            fill(30, 26, 22); rect(299 + lk * 17, 276, 15, 14, 2);
            drawRainIcon(l9Rain.lock[lk], 306.5 + lk * 17, 283, 0.85);
        }
    } else {
        fill(110, 76, 45); quad(286, 254, 362, 254, 356, 230, 292, 230);
        fill(30, 22, 16); rect(288, 254, 72, 6);
        fill(200, 170, 120); textSize(5); textAlign(CENTER); text("(empty)", 324, 284);
    }
    if (!l9Rain.sun) {
        fill(240, 190, 60); ellipse(372, 210, 34, 34);
        fill(250, 210, 90); for (var r = 0; r < 8; r++) { triangle(372 + cos(r * 45) * 15, 210 + sin(r * 45) * 15, 372 + cos(r * 45 + 15) * 12, 210 + sin(r * 45 + 15) * 12, 372 + cos(r * 45) * 26, 210 + sin(r * 45) * 26); }
        fill(150, 100, 30); ellipse(366, 206, 3, 3); ellipse(378, 206, 3, 3); noFill(); stroke(150, 100, 30); strokeWeight(1); arc(372, 212, 10, 7, 0, 180); noStroke();
    } else {
        // the back of the cardboard sun (someone painted on it)
        fill(170, 140, 95); ellipse(372, 210, 50, 50);
        fill(150, 120, 80); for (var r2 = 0; r2 < 8; r2++) { triangle(372 + cos(r2 * 45) * 22, 210 + sin(r2 * 45) * 22, 372 + cos(r2 * 45 + 15) * 18, 210 + sin(r2 * 45 + 15) * 18, 372 + cos(r2 * 45) * 30, 210 + sin(r2 * 45) * 30); }
        for (var ci = 0; ci < 3; ci++) { drawRainIcon(l9Rain.combo[ci], 360 + ci * 12, 212, 0.9); }
        fill(80, 60, 40); textSize(5); textAlign(CENTER); text("TRUNK", 372, 200);
    }
    fill(150, 125, 95); rect(20, 262, 52, 40, 2);
    fill(60, 45, 30); textSize(7); textAlign(CENTER); text("OLD LEVELS", 46, 284); text("(do not open)", 46, 293);
    if (l9Rain.box) {
        fill(120, 98, 72); quad(20, 262, 72, 262, 66, 240, 26, 240);
        fill(30, 24, 18); rect(22, 262, 48, 6);
        if (!l9Rain.spare) {
            fill(255, 250, 220); ellipse(36, 258, 11, 12);
            fill(160, 160, 165); rect(32.5, 263, 7, 5, 1);
        }
        fill(200, 60, 60); rect(48, 252, 16, 12, 1);
        fill(255); textSize(4); text("LVL 0", 56, 260);
    }
    // the hole down to the stage
    fill(12, 8, 6); ellipse(366, 340, 50, 18);
    fill(150, 110, 60); rect(358, 322, 3, 20); rect(371, 322, 3, 20);
    fill(255, 255, 255, 110); textSize(14); text("v", 366, 316);
    // the light bulb + its pull chain
    stroke(60, 60, 60); strokeWeight(1.5); line(L9_CHAIN_X, 0, L9_CHAIN_X, 60);
    stroke(170, 170, 170); strokeWeight(1);
    for (var c = 0; c < 18; c++) { line(L9_CHAIN_X + 4, 66 + c * 4.6, L9_CHAIN_X + 4, 68 + c * 4.6); }
    noStroke();
    fill(80, 80, 80); rect(L9_CHAIN_X - 4, 56, 8, 8, 1);
    if (l9Rain.lit) { fill(255, 240, 180); }
    else if (l9Rain.bulb) { fill(230, 230, 220); }
    else { fill(70, 66, 60); }
    ellipse(L9_CHAIN_X, 70, 14, 16);
    if (!l9Rain.bulb) { stroke(30); strokeWeight(1); line(L9_CHAIN_X - 3, 70, L9_CHAIN_X, 66); line(L9_CHAIN_X, 66, L9_CHAIN_X + 2, 72); noStroke(); }
    fill(200, 180, 120); ellipse(L9_CHAIN_X + 4, L9_CHAIN_Y, 5, 5);
    // the RAIN ALTAR (only once the lights are on)
    if (l9Rain.lit) {
        fill(255, 240, 180, 26); triangle(L9_CHAIN_X, 70, L9_CHAIN_X - 140, 400, L9_CHAIN_X + 260, 400);
        if (l9Rain.altarA < 255) {
            l9Rain.altarA += 3;
            if (frameCount % 4 === 0) { burst(l9Rain.altarX + random(-40, 40), L9_ALTAR_Y - random(0, 90), 140, 210, 255, 2, 1, -0.03); }
            if (l9Rain.altarA >= 255) { l9Say("...a RAIN ALTAR?!", l9Rain.altarX + 40, 140); }
        }
        if (l9Rain.altarHeld) {
            var nx = constrain(mouseX, 110, 300);
            if (abs(nx - l9Rain.altarX) > 1 && frameCount % 3 === 0) { burst(l9Rain.altarX, L9_ALTAR_Y, 150, 140, 130, 2, 1.5, 0.1); shake(0.8); }
            l9Rain.altarX = nx;
        }
        // rain falling into the bowl
        if (l9Rain.sky && abs(l9Rain.altarX - 200) < 2 && l9Rain.fill < 100 && l9Rain.gems < 3) {
            if (!l9Rain.drainTold) {
                l9Rain.drainTold = 1;
                l9Say("the rain falls in... and drains right out of the empty holes!", 200, 140);
            }
            if (frameCount % 5 === 0) { burst(200 + random(-14, 14), L9_ALTAR_Y - 40, 120, 190, 255, 2, 1, 0.2); }
        }
        if (l9Rain.sky && abs(l9Rain.altarX - 200) < 2 && l9Rain.fill < 100 && l9Rain.gems >= 3) {
            l9Rain.fill += 0.6;
            if (l9Rain.fill >= 100) {
                l9Rain.fill = 100;
                flash(120, 200, 255, 60);
                burst(200, L9_ALTAR_Y - 86, 140, 210, 255, 24, 2.5, -0.02);
                l9Say("the bowl is full of rain. the altar is GLOWING.", 200, 140);
            }
        }
        drawRainAltar(l9Rain.altarX, L9_ALTAR_Y, l9Rain.altarA, l9Rain.fill / 100, l9Rain.gems);
    }
    // the thunderstorm
    if (l9Rain.storm > 0) {
        l9Rain.storm++;
        var st = l9Rain.storm;
        fill(0, 0, 30, min(130, st * 3)); rect(0, 0, 400, 400);
        stroke(140, 190, 255, 160); strokeWeight(1.5);
        for (var dr2 = 0; dr2 < 30; dr2++) {
            var dx = 150 + (dr2 * 37) % 100 + (st * 3 + dr2 * 11) % 20;
            var dy = 30 + (st * 9 + dr2 * 43) % 280;
            line(dx, dy, dx - 2, dy + 12);
        }
        noStroke();
        if (st === 40 || st === 80) { shake(5); flash(200, 220, 255, 60); l9Say("*rumble rumble*", 200, 100); }
        if (st < 125) { drawRainGuppy(L9_ALTAR_X, L9_ALTAR_Y - 98, 1.1); }
        if (st >= 120 && st < 138) { drawLightningBolt(200, 40, L9_ALTAR_X, L9_ALTAR_Y - 92, st, 255); }
        if (st === 120) {
            flash(255, 255, 255, 230); shake(14);
            burst(L9_ALTAR_X, L9_ALTAR_Y - 92, 200, 230, 255, 50, 4.5, 0);
            l9Say("*KRAKA-BOOOOM!!!*", 200, 110);
        }
        if (st >= 125 && st < 175) {
            fill(255, 255, 255, 230 - (st - 125) * 3); ellipse(L9_ALTAR_X, L9_ALTAR_Y - 110, 30 + (st - 125) * 1.6, 30 + (st - 125) * 1.6);
        }
        if (st === 175) {
            l9Rain.fish = 1;
            burst(L9_ALTAR_X, L9_ALTAR_Y - 130, 255, 225, 60, 30, 3.5, 0);
            l9Say("the rain guppy EVOLVED into... THE STORM FISH!!!", 200, 110);
        }
        if (st > 270) { l9Rain.storm = -1; }
    }
    if (l9Rain.fish === 1) {
        drawStormFish(L9_ALTAR_X, L9_ALTAR_Y - 140 + sin(frameCount * 3) * 6, 0.75, 1);
    }
    // it's dark up here (the guppy glows a little)
    if (!l9Rain.lit) {
        var glowR = l9HasItem("guppy") || l9Held.type === "guppy" ? 62 : 24;
        srDarkness(mouseX, mouseY, glowR, 250);
        if (glowR > 30) { fill(120, 200, 255, 24); ellipse(mouseX, mouseY, glowR * 2, glowR * 2); }
    }
};
var drawL9RainStage = function() {
    if (l9Rain.hole) {
        noStroke();
        fill(8, 5, 6); ellipse(300, 26, 66, 26);
        fill(30, 20, 18); triangle(268, 22, 278, 34, 284, 20); triangle(318, 20, 326, 34, 334, 24);
        stroke(140, 100, 55); strokeWeight(2.5);
        if (l9Rain.ladder) {
            line(290, 30, 290, 130); line(310, 30, 310, 130);
            strokeWeight(2);
            for (var r = 0; r < 6; r++) { line(290, 44 + r * 16, 310, 44 + r * 16); }
        } else {
            // the ladder got pulled up: only the bottom bit peeks out
            line(290, 28, 290, 40); line(310, 28, 310, 40);
            strokeWeight(2); line(290, 37, 310, 37);
        }
        noStroke();
    }
    if (l9Rain.fishOn) {
        var fy = l9Rain.fishY + sin(frameCount * 3) * 5;
        fill(120, 200, 255, 30); ellipse(l9Rain.fishX, fy, 90, 56);
        drawStormFish(l9Rain.fishX, fy, 0.42, l9Rain.fishX < 200 ? 1 : -1);
    }
};
// clicks in the rain places (returns true if it used the click)
var l9RainPressed = function() {
    if (l9Scene === 0 && l9InRainDoor(mouseX, mouseY)) {
        if (l9Rain.door) { l9Scene = 5; }
        else { l9Say("a faint door... with a raindrop on it. it's locked.", 120, 280); }
        return true;
    }
    if (l9Scene === 5) {
        if (mouseX > 368 && abs(mouseY - 200) < 34) { l9Scene = 0; return true; }
        if (!l9Rain.puddleGem && dist(mouseX, mouseY, 262, 318) < 18) {
            l9Say("something shiny at the bottom of the puddle... it's too deep to reach.", 200, 280);
            return true;
        }
        if (!l9Rain.guppy && dist(mouseX, mouseY, 200, 200) < 46) {
            if (!l9Rain.met) {
                l9Rain.met = 1;
                l9Say("blub! i'm the RAIN GUPPY. i live in this raindrop.", 200, 140);
            } else {
                l9Rain.guppy = 1; l9Inv.push("guppy");
                burst(200, 200, 160, 220, 255, 16, 2, 0);
                l9Say("the rain guppy hops into your bag. (raindrop and all)", 200, 140);
            }
        }
        return true;
    }
    if (l9Scene === 4) {
        if (dist(mouseX, mouseY, 366, 332) < 26) { l9Scene = 3; return true; }
        if (!l9Rain.lit && dist(mouseX, mouseY, L9_CHAIN_X + 4, L9_CHAIN_Y) < 14) {
            if (!l9Rain.bulb) {
                l9Say("*click*  ...nothing. the bulb is burnt out.", 200, 140);
            } else {
                l9Rain.lit = 1;
                flash(255, 240, 180, 90);
                l9Say("*click*  ...and something starts to glow.", 200, 140);
            }
            return true;
        }
        if (mouseX > 16 && mouseX < 76 && mouseY > 238 && mouseY < 304) {
            if (!l9Rain.box) {
                l9Rain.box = 1; shake(2);
                burst(46, 262, 200, 190, 160, 12, 2, 0.1);
                l9Say("you open it. a spare LIGHT BULB... and level 0. (it was bad)", 200, 220);
            } else if (!l9Rain.spare && dist(mouseX, mouseY, 36, 260) < 12) {
                l9Rain.spare = 1; l9Inv.push("bulb");
                l9Say("you take the spare light bulb.", 200, 220);
            } else {
                l9Say("level 0 is in here. it's just a gray square. (do not open)", 200, 220);
            }
            return true;
        }
        if (l9Rain.lit && dist(mouseX, mouseY, 372, 210) < 30) {
            l9Rain.sun = 1 - l9Rain.sun;
            l9Say(l9Rain.sun ? "you flip the cardboard sun. something's painted on the back!" : "you flip the sun back around.", 200, 160);
            return true;
        }
        if (l9Rain.lit && !l9Rain.trunk && mouseX > 296 && mouseX < 352 && mouseY > 272 && mouseY < 294) {
            var lk = constrain(floor((mouseX - 299) / 17), 0, 2);
            l9Rain.lock[lk] = (l9Rain.lock[lk] + 1) % 3;
            if (l9Rain.lock[0] === l9Rain.combo[0] && l9Rain.lock[1] === l9Rain.combo[1] && l9Rain.lock[2] === l9Rain.combo[2]) {
                l9Rain.trunk = 1; l9Inv.push("gem");
                shake(3); burst(324, 250, 120, 200, 255, 20, 2.5, 0);
                l9Say("*CLICK* the trunk opens! there's a RAIN GEM inside!", 200, 160);
            }
            return true;
        }
        if (l9Rain.lit && !l9Rain.trunk && mouseX > 286 && mouseX < 362 && mouseY > 254 && mouseY < 302) {
            l9Say("an old trunk with a lock. it has little pictures instead of numbers.", 200, 160);
            return true;
        }
        if (l9Rain.fish === 1 && dist(mouseX, mouseY, L9_ALTAR_X, L9_ALTAR_Y - 140) < 40) {
            l9Rain.fish = 2; l9Inv.push("fish");
            l9Say("you got THE STORM FISH. (it crackles in your bag)", 200, 140);
            return true;
        }
        if (l9Rain.lit && mouseX > 156 && mouseX < 244 && mouseY > 10 && mouseY < 64) {
            if (!l9Rain.sky) { l9Say("the skylight is stuck shut. the latch is way up there.", 200, 100); }
            else { l9Say("it's pouring out there.", 200, 100); }
            return true;
        }
        if (l9Rain.lit && l9Rain.altarA >= 255 && l9Rain.storm === 0 &&
            abs(mouseX - l9Rain.altarX) < 46 && mouseY > L9_ALTAR_Y - 100 && mouseY < L9_ALTAR_Y) {
            l9Rain.altarHeld = 1;
            if (l9Rain.fill < 100 && !l9Rain.dryTold) {
                l9Rain.dryTold = 1;
                l9Say("a RAIN ALTAR... with a bone-dry bowl. (it's heavy, but it slides)", 200, 140);
            }
            return true;
        }
        return true;
    }
    if (l9Scene === 3) {
        if (l9Rain.hole && abs(mouseX - 300) < 30 && mouseY > 12 && mouseY < (l9Rain.ladder ? 134 : 50)) {
            if (l9Rain.ladder) { l9Scene = 4; }
            else { l9Say("the ladder got yanked up into the hole. it's too high to reach.", 200, 160); }
            return true;
        }
        if (l9Rain.fishOn && dist(mouseX, mouseY, l9Rain.fishX, l9Rain.fishY) < 26) {
            l9Say("*bzzzt*  (the storm fish looks... hungry?)", l9Rain.fishX, l9Rain.fishY - 40);
            return true;
        }
    }
    return false;
};
// letting go of the altar after sliding it
var l9RainReleased = function() {
    if (!l9Rain.altarHeld) { return false; }
    l9Rain.altarHeld = 0;
    if (abs(l9Rain.altarX - 200) < 16) {
        l9Rain.altarX = 200;
        if (l9Rain.sky && l9Rain.gems < 3) { l9Rain.drainTold = 1; l9Say("the rain falls in... and drains right out of the empty holes!", 200, 140); }
        else if (l9Rain.sky) { l9Say("the rain falls right into the altar's bowl!", 200, 140); }
        else { l9Say("the altar is right under the skylight now.", 200, 140); }
    }
    return true;
};
// dropping rain things (returns true if it handled the item)
var l9RainDropped = function(h) {
    if (h === "rainkey") {
        if (l9Scene === 0 && !l9Rain.door && l9InRainDoor(mouseX, mouseY)) {
            l9RemoveItem("rainkey");
            l9Rain.door = 1;
            flash(120, 200, 255, 90); shake(3);
            burst(L9_RDOOR_X + 14, L9_RDOOR_Y + 24, 140, 210, 255, 24, 2.5, 0.05);
            l9Say("the RAIN KEY fits!! *drip*", 140, 280);
        } else {
            l9Say("it's dripping a little.", 200, 340);
        }
        return true;
    }
    if (h === "hanger") {
        if (l9Scene === 3 && l9Rain.hole && !l9Rain.ladder && abs(mouseX - 300) < 44 && mouseY < 90) {
            l9Rain.ladder = 1; shake(4);
            burst(300, 60, 140, 100, 55, 14, 2.5, 0.15);
            l9Say("you hook the ladder with the hanger and yank it down. *CLATTER*", 200, 160);
        } else if (l9Scene === 4 && l9Rain.lit && !l9Rain.sky && mouseX > 150 && mouseX < 250 && mouseY < 80) {
            l9Rain.sky = 1; shake(3);
            flash(150, 190, 255, 50);
            l9Say("you pop the latch with the hanger. it's POURING out there!", 200, 110);
        } else if (l9Scene === 5 && !l9Rain.puddleGem && dist(mouseX, mouseY, 262, 318) < 34) {
            l9Rain.puddleGem = 1; l9Inv.push("gem");
            burst(262, 318, 120, 200, 255, 16, 2, 0.05);
            l9Say("you fish around with the hanger... and pull up a RAIN GEM!", 200, 280);
        } else if (l9Scene === 4 && !l9Rain.lit) {
            l9Say("it's too dark to hook anything.", 200, 140);
        } else {
            l9Say("a wire coat hanger. good for hooking stuff that's too high.", 200, 340);
        }
        return true;
    }
    if (h === "gem") {
        if (l9Scene === 4 && l9Rain.lit && l9Rain.altarA >= 200 && abs(mouseX - l9Rain.altarX) < 50 && mouseY > L9_ALTAR_Y - 110 && mouseY < L9_ALTAR_Y) {
            l9RemoveItem("gem");
            l9Rain.gems++;
            burst(l9Rain.altarX, L9_ALTAR_Y - 42, 120, 200, 255, 14, 2, 0);
            if (l9Rain.gems >= 3) { flash(120, 200, 255, 60); l9Say("all 3 RAIN GEMS are in! the little holes are sealed.", 200, 140); }
            else { l9Say("the gem clicks into the altar. (" + l9Rain.gems + "/3)", 200, 140); }
        } else {
            l9Say("a RAIN GEM. it looks like it fits in something.", 200, 340);
        }
        return true;
    }
    if (h === "bulb") {
        if (l9Scene === 4 && !l9Rain.bulb && dist(mouseX, mouseY, L9_CHAIN_X, 70) < 26) {
            l9Rain.bulb = 1; l9RemoveItem("bulb");
            l9Say("you swap in the new bulb. *squeak squeak*", 200, 140);
        } else {
            l9Say("a light bulb. it goes in a light. (obviously)", 200, 340);
        }
        return true;
    }
    if (h === "guppy") {
        if (l9Scene === 4 && l9Rain.lit && l9Rain.altarA >= 200 && l9Rain.storm === 0 &&
            abs(mouseX - l9Rain.altarX) < 50 && mouseY > L9_ALTAR_Y - 120 && mouseY < L9_ALTAR_Y) {
            if (l9Rain.fill < 100) {
                l9Say("blub... (the bowl is dry. the guppy needs RAIN.)", 200, 140);
            } else {
                l9RemoveItem("guppy");
                l9Rain.storm = 1;
                l9Say("the rain guppy splashes into the bowl... the sky goes dark.", 200, 110);
            }
        } else if (l9Scene === 4 && !l9Rain.lit) {
            l9Say("it's too dark. (the guppy glows a tiny bit though)", 200, 140);
        } else {
            l9Say("blub? (the guppy doesn't want to go there)", 200, 340);
        }
        return true;
    }
    if (h === "fish") {
        if (l9Scene === 3 && l9Tres.onStage && mouseY < 336) { l9Say("TRES is hogging the stage!", 200, 150); return true; }
        if (l9Scene === 3 && mouseX > 40 && mouseX < 340 && mouseY > 150 && mouseY < 336) {
            l9RemoveItem("fish");
            l9Rain.fishOn = 1;
            l9Rain.fishX = mouseX; l9Rain.fishY = constrain(mouseY, 190, 280);
            burst(mouseX, l9Rain.fishY, 150, 220, 255, 16, 2.5, 0);
            l9Say("THE STORM FISH floats over the stage. *bzzzt*", 200, 150);
        } else {
            l9Say("THE STORM FISH wants to be on the STAGE.", 200, 340);
        }
        return true;
    }
    return false;
};

// ---------- THE LETTER VAULT (behind the top-left door; needs the KEY from level 4) ----------
var L9_VDOOR_X = 22;
var L9_VDOOR_Y = 20;
var L9_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var L9_MESSAGES = ["THE PASSWORD IS MOON", "THE PASSWORD IS TOAST", "THE PASSWORD IS GHOST", "THE PASSWORD IS CANDY",
                   "THE PASSWORD IS STORM", "THE PASSWORD IS FROG", "THE PASSWORD IS ACORN"];
var L9_PICS = [
    ["111000", "101000", "111111", "000101", "000101", "000000"],
    [".1..1.", "111111", "111111", ".1111.", "..11..", "......"],
    ["001110", "011000", "110000", "110000", "011000", "001110"],
    ["010010", "010010", "000000", "100001", "011110", "000000"]
];
var L9_PIC_NAMES = ["a KEY", "a HEART", "the MOON", "a SMILE"];
var L9_SLIDE_GOAL = "KEYHOLES";
var l9VInDoor = function(x, y) { return x > L9_VDOOR_X - 6 && x < L9_VDOOR_X + 34 && y > L9_VDOOR_Y - 6 && y < L9_VDOOR_Y + 54; };
var l9PicCell = function(p, r, c) { return L9_PICS[p][r].charAt(c) === "1"; };
var l9Clue = function(cells) {
    var out = []; var run = 0;
    for (var i = 0; i < cells.length; i++) {
        if (cells[i]) { run++; } else if (run > 0) { out.push(run); run = 0; }
    }
    if (run > 0) { out.push(run); }
    if (out.length === 0) { out.push(0); }
    return out;
};
var l9Encrypt = function(msg, shift) {
    var out = "";
    for (var i = 0; i < msg.length; i++) {
        var ch = msg.charAt(i);
        var ix = L9_ALPHA.indexOf(ch);
        out += ix < 0 ? ch : L9_ALPHA.charAt((ix + shift) % 26);
    }
    return out;
};
// ---- detailed drawings ----
var drawL9VaultDoor = function() {
    var x = L9_VDOOR_X; var y = L9_VDOOR_Y;
    noStroke();
    // stone frame around the door
    fill(36, 32, 30); rect(x - 4, y - 5, 36, 53, 4);
    fill(46, 42, 38); for (var st = 0; st < 5; st++) { rect(x - 4, y - 3 + st * 10, 4, 8, 1); rect(x + 28, y + 2 + st * 10, 4, 8, 1); }
    fill(50, 46, 42); rect(x - 4, y - 5, 36, 6, 3);
    if (!l9Vault.door) {
        // a faint wooden door, with K E Y carved into it
        fill(22, 18, 14); rect(x, y, 28, 46, 3);
        fill(30, 24, 18); rect(x + 1, y + 1, 8, 44); rect(x + 10, y + 1, 8, 44); rect(x + 19, y + 1, 8, 44);
        stroke(14, 12, 10); strokeWeight(0.6);
        for (var g = 0; g < 6; g++) { line(x + 3 + g * 4, y + 3, x + 4 + g * 4, y + 42); }
        noStroke();
        // iron bands + rivets
        fill(44, 44, 48); rect(x, y + 7, 28, 3); rect(x, y + 34, 28, 3);
        fill(70, 70, 76); for (var r = 0; r < 4; r++) { ellipse(x + 4 + r * 7, y + 8.5, 2, 2); ellipse(x + 4 + r * 7, y + 35.5, 2, 2); }
        fill(50, 42, 28); textSize(7); textAlign(CENTER);
        text("K", x + 14, y + 17); text("E", x + 14, y + 24); text("Y", x + 14, y + 31);
        // the keyhole (KEY shaped glow, very faint)
        fill(40, 34, 24); rect(x + 9, y + 38, 10, 7, 1);
        fill(255, 200, 90, 30 + sin(frameCount * 3) * 20); ellipse(x + 14, y + 40, 4, 4); rect(x + 13, y + 40, 2, 4);
        // cobweb in the corner
        stroke(80, 80, 80, 90); strokeWeight(0.6);
        line(x, y, x + 10, y + 2); line(x, y, x + 8, y + 8); line(x, y, x + 2, y + 10);
        noFill(); arc(x, y, 10, 10, 0, 90); arc(x, y, 16, 16, 0, 90); noStroke();
    } else {
        fill(255, 200, 100, 30 + sin(frameCount * 4) * 15); rect(x - 8, y - 8, 44, 62, 6);
        fill(60, 40, 22); rect(x, y, 28, 46, 3);
        fill(255, 190, 90, 120); rect(x + 3, y + 3, 22, 40, 2);
        fill(255, 230, 160, 80); ellipse(x + 14, y + 12, 16, 12);
        fill(120, 80, 40); for (var s2 = 0; s2 < 4; s2++) { rect(x + 4 + s2, y + 30 + s2 * 4, 20 - s2 * 2, 3); }
        // the open door swung out, with the KEY still in its lock
        fill(80, 50, 26); quad(x + 28, y, x + 38, y - 4, x + 38, y + 50, x + 28, y + 46);
        fill(44, 44, 48); quad(x + 28, y + 7, x + 38, y + 4, x + 38, y + 7, x + 28, y + 10);
        fill(240, 200, 80); textSize(6); textAlign(CENTER); text("KEY", x + 33, y + 24);
        fill(220, 170, 60); ellipse(x + 33, y + 34, 6, 6); fill(60, 40, 22); ellipse(x + 33, y + 34, 2, 2);
        // dust drifting out
        fill(255, 220, 150, 120);
        for (var d = 0; d < 4; d++) { ellipse(x + 8 + d * 5 + sin(frameCount * 3 + d * 80) * 3, y + 40 - (frameCount * 0.5 + d * 12) % 44, 2, 2); }
    }
};
var drawL9VaultBg = function() {
    noStroke();
    background(26, 22, 30);
    for (var r = 0; r < 20; r++) {
        for (var c = 0; c < 9; c++) {
            var bx = c * 48 + (r % 2) * 24 - 24; var by = r * 22;
            fill(44 + (r * 7 + c * 13) % 12, 38 + (r * 5 + c * 11) % 10, 48 + (r * 3 + c * 7) % 12);
            rect(bx + 1, by + 1, 46, 20, 2);
        }
    }
    // faint letters carved all over the walls
    fill(70, 62, 78, 120); textSize(14); textAlign(CENTER);
    for (var l = 0; l < 14; l++) { text(L9_ALPHA.charAt((l * 7) % 26), (l * 71) % 380 + 10, (l * 113) % 360 + 20); }
    // two torches
    for (var t = 0; t < 2; t++) {
        var tx = t === 0 ? 24 : 376; var ty = 150;
        fill(255, 160, 60, 30 + sin(frameCount * 9 + t * 90) * 12); ellipse(tx, ty - 10, 90, 90);
        fill(90, 60, 30); rect(tx - 3, ty, 6, 26, 2);
        fill(60, 60, 66); rect(tx - 6, ty - 2, 12, 6, 2);
        fill(255, 140, 40); ellipse(tx, ty - 8 + sin(frameCount * 15 + t) * 1.5, 12, 18);
        fill(255, 220, 90); ellipse(tx, ty - 6, 6, 10);
    }
    // gold trim on the floor + checker tiles
    fill(30, 24, 20); rect(0, 380, 400, 20);
    for (var ft = 0; ft < 20; ft++) { fill(ft % 2 ? 40 : 24, ft % 2 ? 32 : 20, ft % 2 ? 28 : 18); rect(ft * 20, 382, 20, 18); }
    fill(170, 130, 50); rect(0, 378, 400, 3);
    // stone pillars on each side
    for (var pl = 0; pl < 2; pl++) {
        var px = pl === 0 ? 40 : 346;
        fill(60, 54, 66); rect(px, 50, 14, 330);
        fill(80, 72, 88); rect(px + 2, 50, 4, 330);
        fill(90, 82, 96); rect(px - 4, 44, 22, 8, 2); rect(px - 4, 372, 22, 8, 2);
    }
    // hanging banners: K, E, Y
    var bn = ["K", "E", "Y"];
    for (var b = 0; b < 3; b++) {
        var bx2 = 120 + b * 80 + sin(frameCount * 2 + b * 60) * 1.5;
        fill(120, 30, 40, 120); rect(bx2 - 9, 44, 18, 34);
        triangle(bx2 - 9, 78, bx2 + 9, 78, bx2, 70);
        fill(200, 160, 70, 140); textSize(10); textAlign(CENTER); text(bn[b], bx2, 62);
        fill(170, 130, 50, 140); rect(bx2 - 11, 42, 22, 3);
    }
    // cobwebs in the top corners
    stroke(140, 140, 150, 70); strokeWeight(0.7); noFill();
    for (var cw = 0; cw < 2; cw++) {
        var cxw = cw === 0 ? 0 : 400; var dir = cw === 0 ? 1 : -1;
        line(cxw, 0, cxw + dir * 40, 30); line(cxw, 0, cxw + dir * 20, 40); line(cxw, 0, cxw + dir * 46, 12);
        for (var ring = 1; ring < 4; ring++) {
            line(cxw + dir * 15 * ring, 4 * ring, cxw + dir * 13 * ring, 10 * ring);
            line(cxw + dir * 13 * ring, 10 * ring, cxw + dir * 7 * ring, 13 * ring);
        }
    }
    noStroke();
    // floating dust in the torchlight
    fill(255, 220, 160, 70);
    for (var du = 0; du < 10; du++) { ellipse((du * 43 + frameCount * 0.3) % 400, (du * 67 + sin(frameCount * 2 + du * 30) * 10) % 370, 2, 2); }
};
var drawL9VaultTitle = function(name, sub) {
    noStroke();
    fill(60, 44, 20); rect(70, 8, 260, 34, 4);
    fill(200, 160, 70); rect(72, 10, 256, 30, 3);
    fill(230, 195, 110); rect(72, 10, 256, 4, 3);
    fill(150, 110, 40); for (var sc = 0; sc < 2; sc++) { ellipse(78 + sc * 244, 16, 5, 5); ellipse(78 + sc * 244, 34, 5, 5); }
    fill(60, 40, 16); textSize(13); textAlign(CENTER); text(name, 200, 26);
    textSize(8);
    var sw = textWidth(sub); if (sw > 248) { textSize(8 * 248 / sw); }
    text(sub, 200, 36);
};
var drawL9VaultArrows = function() {
    fill(255, 255, 255, 120); textSize(18); textAlign(CENTER); text("<", 12, 206);
    if (l9Vault.solved) {
        fill(255, 220, 100, 160 + sin(frameCount * 6) * 80); textSize(26); text(">", 384, 210);
    }
};
var drawL9VaultCipher = function() {
    var V = l9Vault;
    drawL9VaultTitle("V-1  THE CIPHER WHEEL", "every secret message here starts with THE");
    noStroke();
    // the scroll with the coded message
    fill(220, 200, 150); rect(18, 66, 150, 120, 4);
    fill(190, 165, 115); ellipse(18, 126, 12, 120); ellipse(168, 126, 12, 120);
    fill(70, 40, 20); textSize(13); textAlign(CENTER);
    var enc = l9Encrypt(V.msg, V.shift);
    var w2 = enc.split(" ");
    for (var i = 0; i < w2.length; i++) { text(w2[i], 93, 96 + i * 22); }
    stroke(190, 165, 115); strokeWeight(0.6);
    for (var sl = 0; sl < 5; sl++) { line(30, 80 + sl * 22, 156, 80 + sl * 22); }
    noStroke();
    fill(170, 30, 30); ellipse(150, 176, 18, 18); fill(200, 60, 60); ellipse(149, 175, 11, 11);
    fill(120, 20, 20); textSize(7); text("V", 149, 178); textSize(13);
    // the decoder wheel: OUTER = coded letter, INNER = real letter
    var cx = 288; var cy = 178;
    fill(110, 80, 40); ellipse(cx, cy, 214, 214);
    fill(220, 190, 120); ellipse(cx, cy, 204, 204);
    fill(170, 130, 70); ellipse(cx, cy, 150, 150);
    fill(235, 210, 150); ellipse(cx, cy, 140, 140);
    stroke(140, 100, 50); strokeWeight(1);
    for (var tk = 0; tk < 26; tk++) {
        var ta = tk * (360 / 26) - 90 + 180 / 26;
        line(cx + cos(ta) * 76, cy + sin(ta) * 76, cx + cos(ta) * 101, cy + sin(ta) * 101);
    }
    noStroke();
    fill(110, 80, 40); ellipse(cx, cy, 40, 40);
    fill(150, 110, 50); for (var sp2 = 0; sp2 < 6; sp2++) { var spa = sp2 * 60 + V.wheel * (360 / 26); ellipse(cx + cos(spa) * 13, cy + sin(spa) * 13, 5, 5); }
    fill(200, 160, 80); ellipse(cx, cy, 14, 14);
    fill(255, 240, 200, 120); ellipse(cx - 3, cy - 3, 5, 5);
    textSize(10);
    for (var k = 0; k < 26; k++) {
        var a = k * (360 / 26) - 90;
        fill(60, 30, 10); text(L9_ALPHA.charAt(k), cx + cos(a) * 90, cy + sin(a) * 90 + 4);
        fill(150, 30, 30); text(L9_ALPHA.charAt((k - V.wheel + 26) % 26), cx + cos(a) * 60, cy + sin(a) * 60 + 4);
    }
    // little marker at the top
    fill(200, 40, 40); triangle(cx - 6, cy - 112, cx + 6, cy - 112, cx, cy - 102);
    // turn buttons
    fill(70, 52, 34); rect(cx - 60, cy + 116, 50, 20, 4); rect(cx + 10, cy + 116, 50, 20, 4);
    fill(240, 230, 200); textSize(10); text("<< TURN", cx - 35, cy + 130); text("TURN >>", cx + 35, cy + 130);
    fill(200, 190, 160); textSize(8); text("outer ring = coded letter     inner ring = real letter", cx - 40, cy + 148);
    // the password dials
    fill(30, 24, 20); rect(18, 214, 150, 120, 5);
    fill(220, 200, 150); textSize(9); text("PASSWORD:", 93, 232);
    var n = V.pass.length;
    for (var d = 0; d < n; d++) {
        var dx = 93 - (n - 1) * 14 + d * 28;
        fill(60, 52, 46); rect(dx - 12, 244, 24, 34, 4);
        fill(240, 230, 200); textSize(18); text(L9_ALPHA.charAt(V.dial[d]), dx, 268);
        fill(150, 140, 120); triangle(dx - 5, 241, dx + 5, 241, dx, 236); triangle(dx - 5, 281, dx + 5, 281, dx, 286);
    }
    fill(200, 60, 50); rect(58, 298, 70, 22, 4);
    fill(255); textSize(10); text(V.solved ? "OPEN!" : "UNLOCK", 93, 313);
};
var drawL9VaultGrid = function() {
    var V = l9Vault;
    drawL9VaultTitle("V-2  THE PICTURE GRID", "the numbers say how many squares in a row are filled, in order");
    var gx = 140; var gy = 112; var S = 34;
    noStroke();
    fill(120, 90, 36); rect(gx - 10, gy - 10, 6 * S + 20, 6 * S + 20, 6);
    fill(180, 140, 60); rect(gx - 10, gy - 10, 6 * S + 20, 4, 6);
    fill(220, 180, 90); for (var cn = 0; cn < 4; cn++) { ellipse(gx - 5 + (cn % 2) * (6 * S + 10), gy - 5 + floor(cn / 2) * (6 * S + 10), 7, 7); }
    fill(30, 24, 20); rect(gx - 4, gy - 4, 6 * S + 8, 6 * S + 8, 4);
    // a little paint brush and pot next to the grid
    fill(80, 70, 90); rect(352, 300, 26, 24, 3); fill(40, 34, 30); ellipse(365, 300, 26, 8);
    stroke(150, 100, 50); strokeWeight(3); line(368, 300, 384, 262); noStroke();
    fill(30); ellipse(368, 300, 6, 10);
    textAlign(CENTER);
    for (var r = 0; r < 6; r++) {
        var rowCells = [];
        for (var c = 0; c < 6; c++) { rowCells.push(l9PicCell(V.pic, r, c)); }
        var rc = l9Clue(rowCells);
        fill(240, 220, 160); textSize(12); text(rc.join("  "), gx - 34, gy + r * S + 22);
    }
    for (var c2 = 0; c2 < 6; c2++) {
        var colCells = [];
        for (var r2 = 0; r2 < 6; r2++) { colCells.push(l9PicCell(V.pic, r2, c2)); }
        var cc = l9Clue(colCells);
        for (var q = 0; q < cc.length; q++) { fill(240, 220, 160); textSize(12); text(cc[q], gx + c2 * S + S / 2, gy - 8 - (cc.length - 1 - q) * 14); }
    }
    for (var i = 0; i < 36; i++) {
        var x = gx + (i % 6) * S; var y = gy + floor(i / 6) * S;
        fill(V.solved ? 250 : 220, V.solved ? 230 : 210, V.solved ? 170 : 190); rect(x + 1, y + 1, S - 2, S - 2, 2);
        if (V.grid[i] === 1) {
            if (V.solved) { fill(200, 60, 60); } else { fill(40, 34, 30); }
            rect(x + 4, y + 4, S - 8, S - 8, 2);
        } else if (V.grid[i] === 2) {
            stroke(150, 120, 100); strokeWeight(2);
            line(x + 10, y + 10, x + S - 10, y + S - 10); line(x + S - 10, y + 10, x + 10, y + S - 10); noStroke();
        }
    }
    fill(30, 24, 20); rect(gx + 2 * S - 1, gy, 2, 6 * S); rect(gx + 4 * S - 1, gy, 2, 6 * S);
    rect(gx, gy + 2 * S - 1, 6 * S, 2); rect(gx, gy + 4 * S - 1, 6 * S, 2);
    fill(200, 190, 160); textSize(9);
    text("click: fill  >  mark X  >  empty", 242, 340);
    if (V.solved) { fill(255, 220, 100); textSize(13); text("it's " + L9_PIC_NAMES[V.pic] + "!", 242, 360); }
};
// ---------- THE SLIDING LETTERS: "TELL ME" works out the next slide for you ----------
var l9SlideHelp = {on: 0, key: "", next: -1, left: 0, shown: 0};
var l9SlideSolve = function() {
    // A* search on the letters (the two E's count as the same letter)
    var V = l9Vault;
    var start = "";
    for (var i = 0; i < 9; i++) { start += V.tiles[i] < 0 ? "_" : L9_SLIDE_GOAL.charAt(V.tiles[i]); }
    if (start === l9SlideHelp.key) { return; }
    l9SlideHelp.key = start;
    var goal = "KEYHOLES_";
    var hfun = function(s) {
        var h = 0;
        for (var p = 0; p < 9; p++) {
            var ch = s.charAt(p);
            if (ch === "_") { continue; }
            var best = 9;
            for (var q = 0; q < 9; q++) {
                if (goal.charAt(q) === ch) { var d = abs(floor(p / 3) - floor(q / 3)) + abs(p % 3 - q % 3); if (d < best) { best = d; } }
            }
            h += best;
        }
        return h;
    };
    var heap = [[hfun(start), 0, start]];
    var came = {}; came[start] = "";
    var gsc = {}; gsc[start] = 0;
    var found = ""; var n = 0;
    while (heap.length > 0 && n < 60000) {
        n++;
        // pop the smallest
        var bi = 0;
        for (var hi = 1; hi < heap.length; hi++) { if (heap[hi][0] < heap[bi][0]) { bi = hi; } }
        var cur = heap[bi]; heap[bi] = heap[heap.length - 1]; heap.pop();
        var s = cur[2];
        if (cur[1] > gsc[s]) { continue; }
        if (s === goal) { found = s; break; }
        var b = s.indexOf("_");
        var nbs = [];
        if (b >= 3) { nbs.push(b - 3); } if (b < 6) { nbs.push(b + 3); } if (b % 3 > 0) { nbs.push(b - 1); } if (b % 3 < 2) { nbs.push(b + 1); }
        for (var k = 0; k < nbs.length; k++) {
            var t = nbs[k];
            var arr = s.split(""); arr[b] = arr[t]; arr[t] = "_";
            var ns = arr.join("");
            var g2 = cur[1] + 1;
            if (gsc[ns] === undefined || g2 < gsc[ns]) { gsc[ns] = g2; came[ns] = s; heap.push([g2 + hfun(ns), g2, ns]); }
        }
    }
    l9SlideHelp.next = -1; l9SlideHelp.left = 0;
    if (found === "") { return; }
    var c2 = found; var steps = 0;
    // the whole list of moves (for the cheater): which letter slides which way
    var path = [];
    var cn = found;
    while (cn !== start && came[cn] !== "") {
        var pv = came[cn];
        var from = cn.indexOf("_"); var to = pv.indexOf("_");
        var dir = to === from + 1 ? "right" : (to === from - 1 ? "left" : (to === from + 3 ? "down" : "up"));
        path.unshift(pv.charAt(from) + " " + dir);
        cn = pv;
    }
    l9SlideHelp.path = path;
    while (came[c2] !== start && came[c2] !== "") { c2 = came[c2]; steps++; }
    // the tile that moves into the gap is where the gap is in the NEXT state
    l9SlideHelp.next = c2.indexOf("_");
    l9SlideHelp.left = gsc[found];
};
var drawL9VaultSlide = function() {
    var V = l9Vault;
    drawL9VaultTitle("V-3  THE SLIDING LETTERS", "slide the tiles until they spell KEYHOLES");
    var gx = 128; var gy = 92; var S = 48;
    noStroke();
    fill(60, 44, 20); rect(gx - 8, gy - 8, 3 * S + 16, 3 * S + 16, 6);
    fill(200, 160, 70); for (var rv = 0; rv < 8; rv++) { ellipse(gx - 4 + (rv % 4) * (3 * S + 8) / 3, rv < 4 ? gy - 4 : gy + 3 * S + 4, 4, 4); }
    fill(30, 24, 20); rect(gx - 2, gy - 2, 3 * S + 4, 3 * S + 4, 3);
    fill(22, 18, 14); rect(gx + S - 1, gy, 2, 3 * S); rect(gx + 2 * S - 1, gy, 2, 3 * S); rect(gx, gy + S - 1, 3 * S, 2); rect(gx, gy + 2 * S - 1, 3 * S, 2);
    for (var i = 0; i < 9; i++) {
        var tl = V.tiles[i];
        if (tl < 0) { continue; }
        var x = gx + (i % 3) * S; var y = gy + floor(i / 3) * S;
        var right = (tl === i);
        fill(right && V.solved ? 250 : 200, right && V.solved ? 215 : 170, right && V.solved ? 120 : 100); rect(x + 2, y + 2, S - 4, S - 4, 5);
        fill(230, 205, 140); rect(x + 2, y + 2, S - 4, 6, 5);
        fill(150, 115, 60); rect(x + 2, y + S - 8, S - 4, 6, 5);
        stroke(170, 135, 75); strokeWeight(0.6); line(x + 6, y + 14, x + S - 8, y + 16); line(x + 8, y + S - 14, x + S - 6, y + S - 12); noStroke();
        fill(255, 240, 200, 120); textSize(26); textAlign(CENTER); text(L9_SLIDE_GOAL.charAt(tl), x + S / 2 - 1, y + S / 2 + 8);
        fill(60, 36, 14); text(L9_SLIDE_GOAL.charAt(tl), x + S / 2, y + S / 2 + 9);
    }
    fill(200, 190, 160); textSize(10); textAlign(CENTER); text("moves: " + V.moves, gx + 1.5 * S, gy + 3 * S + 26);
    // the TELL ME helper (only shows up after you type "cheater")
    if (!V.solved && l9SlideHelp.shown) {
        fill(l9SlideHelp.on ? 90 : 60, l9SlideHelp.on ? 140 : 44, l9SlideHelp.on ? 60 : 20); rect(140, 272, 120, 24, 5);
        fill(255, 240, 200); textSize(11); text(l9SlideHelp.on ? "TELLING YOU..." : "TELL ME WHAT TO DO", 200, 288);
        if (l9SlideHelp.on) {
            l9SlideSolve();
            if (l9SlideHelp.next >= 0) {
                var hx = gx + (l9SlideHelp.next % 3) * S; var hy = gy + floor(l9SlideHelp.next / 3) * S;
                noFill(); stroke(120, 255, 140, 160 + sin(frameCount * 10) * 90); strokeWeight(4); rect(hx + 2, hy + 2, S - 4, S - 4, 5); noStroke();
                fill(200, 255, 200); textSize(10);
                text("click the GLOWING tile.  (" + l9SlideHelp.left + " moves to go)", 200, 314);
            }
        }
    }
    if (!V.solved && !(l9SlideHelp.shown && l9SlideHelp.on)) {
        fill(200, 190, 160); textSize(9); text("goal: K E Y / H O L / E S _   (the blank goes bottom-right)", 200, 314);
    }
    // the goal, shown small on a plaque
    fill(60, 44, 20); rect(300, 110, 80, 80, 4);
    fill(200, 160, 70); rect(304, 114, 72, 72, 3);
    fill(60, 40, 16); textSize(14);
    text("K E Y", 340, 138); text("H O L", 340, 158); text("E S", 334, 178);
};
var drawL9VaultReward = function() {
    drawL9VaultTitle("THE REWARD", "you made it through the Letter Vault");
    drawL9TresChest();
};
// ---------- V-4: K OR Y. fill the grid with K's and Y's ----------
var vtKyDone = function() {
    var V = l9Vault;
    for (var i = 0; i < 36; i++) { if (V.ky[i] !== V.kySol[i] + 1) { return false; } }
    return true;
};
var drawL9VaultKY = function() {
    var V = l9Vault; var i;
    drawL9VaultTitle("V-4  K OR Y", "3 K's and 3 Y's in every row + column. never 3 in a row.");
    fill(200, 190, 160); textSize(8); textAlign(CENTER); text("(and no two rows can be the same, no two columns either.)  click: K > Y > empty", 200, 56);
    var gx = 92; var gy = 66; var S = 36;
    fill(30, 24, 20); rect(gx - 4, gy - 4, S * 6 + 8, S * 6 + 8, 4);
    for (i = 0; i < 36; i++) {
        var x = gx + (i % 6) * S; var y = gy + floor(i / 6) * S;
        var giv = V.kyGiv.indexOf(i) >= 0;
        fill(giv ? 200 : 230, giv ? 170 : 215, giv ? 110 : 180); rect(x + 1, y + 1, S - 2, S - 2, 3);
        if (V.ky[i] > 0) { fill(giv ? 60 : 120, giv ? 36 : 40, giv ? 14 : 40); textSize(22); text(V.ky[i] === 1 ? "K" : "Y", x + S / 2, y + S / 2 + 8); }
    }
};
var l9VaultKYPressed = function() {
    var V = l9Vault;
    var c = floor((mouseX - 92) / 36); var r = floor((mouseY - 66) / 36);
    if (c < 0 || r < 0 || c > 5 || r > 5) { return; }
    var i = r * 6 + c;
    if (V.kyGiv.indexOf(i) >= 0) { l9Say("that letter is carved in. it can't change.", 200, 372); return; }
    V.ky[i] = (V.ky[i] + 1) % 3;
    if (vtKyDone()) { V.solved = 1; flash(255, 230, 150, 80); l9Say("K's and Y's everywhere! ( > )", 200, 372); }
};
// ---------- V-5: ALPHABET ORDER. A to E in every row + column. the arrows point to the LATER letter ----------
var VT_LET = "ABCDE";
var drawL9VaultABC = function() {
    var V = l9Vault; var i;
    drawL9VaultTitle("V-5  ALPHABET ORDER", "put A B C D E in every row and column (once each).");
    fill(200, 190, 160); textSize(8); textAlign(CENTER); text("<  means the LEFT letter comes earlier in the alphabet ( > = later).  click a square to change it.", 200, 56);
    var gx = 92; var gy = 72; var S = 44;
    fill(30, 24, 20); rect(gx - 6, gy - 6, S * 5 + 4, S * 5 + 4, 4);
    for (i = 0; i < 25; i++) {
        var x = gx + (i % 5) * S; var y = gy + floor(i / 5) * S;
        var giv = V.abGiv.indexOf(i) >= 0;
        fill(giv ? 200 : 230, giv ? 170 : 215, giv ? 110 : 180); rect(x, y, S - 8, S - 8, 3);
        if (V.ab[i] > 0) { fill(giv ? 60 : 120, giv ? 36 : 40, giv ? 14 : 40); textSize(20); text(VT_LET.charAt(V.ab[i] - 1), x + (S - 8) / 2, y + (S - 8) / 2 + 7); }
    }
    // the < signs
    fill(255, 220, 120); textSize(14);
    for (i = 0; i < V.abIneq.length; i += 2) {
        var a = V.abIneq[i]; var b = V.abIneq[i + 1];
        var ax = gx + (a % 5) * S + (S - 8) / 2; var ay = gy + floor(a / 5) * S + (S - 8) / 2;
        var bx = gx + (b % 5) * S + (S - 8) / 2; var by = gy + floor(b / 5) * S + (S - 8) / 2;
        var mx = (ax + bx) / 2; var my = (ay + by) / 2;
        if (abs(ay - by) < 1) { text(ax < bx ? "<" : ">", mx, my + 5); }
        else { text(ay < by ? "^" : "v", mx, my + 6); }
    }
    fill(200, 190, 160); textSize(8); text("(^ means the top letter comes EARLIER.  v means the bottom one does.)", 200, 300);
};
var l9VaultABCPressed = function() {
    var V = l9Vault;
    var c = floor((mouseX - 92) / 44); var r = floor((mouseY - 72) / 44);
    if (c < 0 || r < 0 || c > 4 || r > 4) { return; }
    var i = r * 5 + c;
    if (V.abGiv.indexOf(i) >= 0) { l9Say("that letter is carved in. it can't change.", 200, 372); return; }
    V.ab[i] = (V.ab[i] + 1) % 6;
    for (var k = 0; k < 25; k++) { if (V.ab[k] !== V.abSol[k]) { return; } }
    V.solved = 1; flash(255, 230, 150, 80); l9Say("A to E, all in order! ( > )", 200, 372);
};
// ---------- V-6: THE WORD LADDER. change ONE letter at a time ----------
var vtWordOK = function(w) { return (" " + VT_WORDS + " ").indexOf(" " + w + " ") >= 0; };
var vtOneApart = function(a, b) {
    var d = 0;
    for (var i = 0; i < 3; i++) { if (a.charAt(i) !== b.charAt(i)) { d++; } }
    return d === 1;
};
var vtRung = function(k) {
    var V = l9Vault;
    if (k === 0) { return V.lad[0]; }
    if (k === 4) { return V.lad[1]; }
    var w = "";
    for (var i = 0; i < 3; i++) { w += L9_ALPHA.charAt(V.rung[(k - 1) * 3 + i]); }
    return w;
};
var drawL9VaultLadder = function() {
    var V = l9Vault; var k; var i;
    drawL9VaultTitle("V-6  THE WORD LADDER", "change ONE letter per step. every step must be a real word.");
    fill(200, 190, 160); textSize(8); textAlign(CENTER); text("click the top/bottom half of a letter to change it", 200, 56);
    // the ladder rails
    fill(120, 80, 40); rect(100, 64, 10, 300, 3); rect(290, 64, 10, 300, 3);
    for (k = 0; k < 5; k++) {
        var y = 76 + k * 60;
        fill(150, 100, 50); rect(110, y + 10, 180, 8, 2);
        var w = vtRung(k);
        var good = vtWordOK(w) && (k === 0 || vtOneApart(vtRung(k - 1), w));
        for (i = 0; i < 3; i++) {
            var x = 150 + i * 50;
            var fixed = k === 0 || k === 4;
            fill(fixed ? 200 : 230, fixed ? 170 : 215, fixed ? 110 : 180); rect(x - 18, y - 10, 36, 40, 5);
            fill(fixed ? 60 : (good ? 40 : 160), fixed ? 36 : (good ? 110 : 40), fixed ? 14 : (good ? 40 : 40)); textSize(24); text(w.charAt(i), x, y + 19);
            if (!fixed) { fill(150, 140, 120); triangle(x - 5, y - 12, x + 5, y - 12, x, y - 17); triangle(x - 5, y + 32, x + 5, y + 32, x, y + 37); }
        }
        if (k > 0 && k < 4) {
            fill(good ? 140 : 255, good ? 255 : 140, good ? 140 : 140); textSize(9);
            text(!vtWordOK(w) ? "not a word" : (vtOneApart(vtRung(k - 1), w) ? "ok!" : "change ONE letter"), 340, y + 16);
        }
    }
    var last = vtOneApart(vtRung(3), vtRung(4));
    fill(last ? 140 : 255, last ? 255 : 160, 140); textSize(9); text(last ? "ok!" : "must be 1 letter away", 340, 76 + 4 * 60 + 16);
};
var l9VaultLadderPressed = function() {
    var V = l9Vault;
    for (var k = 1; k <= 3; k++) {
        var y = 76 + k * 60;
        for (var i = 0; i < 3; i++) {
            var x = 150 + i * 50;
            if (abs(mouseX - x) < 20 && mouseY > y - 18 && mouseY < y + 38) {
                var j = (k - 1) * 3 + i;
                if (mouseY < y + 10) { V.rung[j] = (V.rung[j] + 25) % 26; } else { V.rung[j] = (V.rung[j] + 1) % 26; }
                var ok = true;
                for (var q = 1; q <= 4; q++) { if (!vtWordOK(vtRung(q)) || !vtOneApart(vtRung(q - 1), vtRung(q))) { ok = false; } }
                if (ok) { V.solved = 1; flash(255, 230, 150, 80); l9Say(V.lad[0] + " all the way to " + V.lad[1] + "! ( > )", 200, 372); }
                return;
            }
        }
    }
};
// a ladder that works (for cheater)
var vtLadderPath = function() {
    var V = l9Vault;
    var words = VT_WORDS.split(" ");
    var prev = {}; prev[V.lad[0]] = "";
    var q = [V.lad[0]];
    while (q.length > 0) {
        var u = q.shift();
        if (u === V.lad[1]) { break; }
        for (var i = 0; i < words.length; i++) { if (prev[words[i]] === undefined && vtOneApart(u, words[i])) { prev[words[i]] = u; q.push(words[i]); } }
    }
    var path = []; var c = V.lad[1];
    while (c !== "" && c !== undefined) { path.unshift(c); c = prev[c]; }
    return path;
};
var l9VaultSetupMore = function(room) {
    var V = l9Vault; var i;
    if (room === 3) {
        var P = VT_KY[floor(random(0, VT_KY.length))];
        V.kySol = P[0]; V.kyGiv = []; V.ky = [];
        for (i = 0; i < 36; i++) { V.ky.push(0); }
        for (i = 0; i < P[1].length; i += 2) { V.kyGiv.push(P[1][i]); V.ky[P[1][i]] = P[1][i + 1] + 1; }
    } else if (room === 4) {
        var Q = VT_ABC[floor(random(0, VT_ABC.length))];
        V.abSol = Q[0]; V.abGiv = []; V.ab = []; V.abIneq = Q[2];
        for (i = 0; i < 25; i++) { V.ab.push(0); }
        for (i = 0; i < Q[1].length; i += 2) { V.abGiv.push(Q[1][i]); V.ab[Q[1][i]] = Q[1][i + 1]; }
    } else if (room === 5) {
        V.lad = VT_LADDERS[floor(random(0, VT_LADDERS.length))];
        V.rung = [];
        for (var k = 0; k < 3; k++) { for (i = 0; i < 3; i++) { V.rung.push(L9_ALPHA.indexOf(V.lad[0].charAt(i))); } }
    }
};
var l9VaultSetup = function(room) {
    var V = l9Vault;
    V.room = room; V.t = 0; V.solved = 0;
    if (room === 0) {
        V.msg = L9_MESSAGES[floor(random(0, L9_MESSAGES.length))];
        V.shift = floor(random(3, 23));
        var words = V.msg.split(" ");
        V.pass = words[words.length - 1];
        V.wheel = 0;
        V.dial = [];
        for (var i = 0; i < V.pass.length; i++) { V.dial.push(0); }
    } else if (room === 1) {
        V.pic = floor(random(0, L9_PICS.length));
        V.grid = [];
        for (var g = 0; g < 36; g++) { V.grid.push(0); }
    } else if (room === 2) {
        V.tiles = [];
        for (var k = 0; k < 8; k++) { V.tiles.push(k); }
        V.tiles.push(-1);
        var blank = 8;
        var last = -1;
        for (var m = 0; m < 160; m++) {
            var br = floor(blank / 3); var bc = blank % 3;
            var opts = [];
            if (br > 0) { opts.push(blank - 3); }
            if (br < 2) { opts.push(blank + 3); }
            if (bc > 0) { opts.push(blank - 1); }
            if (bc < 2) { opts.push(blank + 1); }
            var pick = opts[floor(random(0, opts.length))];
            if (pick === last && opts.length > 1) { pick = opts[(opts.indexOf(pick) + 1) % opts.length]; }
            V.tiles[blank] = V.tiles[pick]; V.tiles[pick] = -1;
            last = blank; blank = pick;
        }
        V.moves = 0;
        l9SlideHelp = {on: 0, key: "", next: -1, left: 0, shown: 0};
    } else if (room >= 3 && room <= 5) {
        l9VaultSetupMore(room);
    }
};
var drawL9Vault = function() {
    drawL9VaultBg();
    var V = l9Vault;
    if (V.room === 0) { drawL9VaultCipher(); }
    else if (V.room === 1) { drawL9VaultGrid(); }
    else if (V.room === 2) { drawL9VaultSlide(); }
    else if (V.room === 3) { drawL9VaultKY(); }
    else if (V.room === 4) { drawL9VaultABC(); }
    else if (V.room === 5) { drawL9VaultLadder(); }
    else { drawL9VaultReward(); }
    drawL9VaultArrows();
};
var l9VaultPressed = function() {
    var V = l9Vault;
    if (l9Scene === 0 && l9InRainDoor(mouseX, mouseY)) { return false; }
    if (l9Scene === 0 && l9VInDoor(mouseX, mouseY)) {
        if (V.door) { l9Scene = 6; if (V.room === 0 && V.msg === "") { l9VaultSetup(0); } }
        else { l9Say("a tiny door in the corner. it says K E Y on it. it's locked.", 140, 90); }
        return true;
    }
    if (l9Scene !== 6) { return false; }
    if (mouseX < 26 && abs(mouseY - 200) < 34) { l9Scene = 0; return true; }
    if (V.solved && V.room < 6 && mouseX > 368 && abs(mouseY - 202) < 30) { l9VaultSetup(V.room + 1); return true; }
    if (V.room === 0 && !V.solved) {
        var cx = 288; var cy = 178;
        if (mouseY > cy + 116 && mouseY < cy + 136) {
            if (mouseX > cx - 60 && mouseX < cx - 10) { V.wheel = (V.wheel + 25) % 26; return true; }
            if (mouseX > cx + 10 && mouseX < cx + 60) { V.wheel = (V.wheel + 1) % 26; return true; }
        }
        var n = V.pass.length;
        for (var d = 0; d < n; d++) {
            var dx = 93 - (n - 1) * 14 + d * 28;
            if (abs(mouseX - dx) < 13 && mouseY > 234 && mouseY < 290) {
                if (mouseY < 261) { V.dial[d] = (V.dial[d] + 1) % 26; } else { V.dial[d] = (V.dial[d] + 25) % 26; }
                return true;
            }
        }
        if (mouseX > 58 && mouseX < 128 && mouseY > 298 && mouseY < 320) {
            var word = "";
            for (var w = 0; w < n; w++) { word += L9_ALPHA.charAt(V.dial[w]); }
            if (word === V.pass) {
                V.solved = 1; flash(255, 230, 150, 80); shake(4);
                l9Say("*CLICK* the cipher lock opens!  ( > )", 200, 360);
            } else {
                shake(3); l9Say("\"" + word + "\"? ...nope. the lock stays shut.", 200, 360);
            }
            return true;
        }
    } else if (V.room === 1 && !V.solved) {
        var gx = 140; var gy = 112; var S = 34;
        var c = floor((mouseX - gx) / S); var r = floor((mouseY - gy) / S);
        if (c >= 0 && r >= 0 && c < 6 && r < 6) {
            V.grid[r * 6 + c] = (V.grid[r * 6 + c] + 1) % 3;
            // solved when every row and column matches its numbers
            var ok = true;
            for (var rr = 0; rr < 6 && ok; rr++) {
                var have = []; var want = [];
                for (var k = 0; k < 6; k++) { have.push(V.grid[rr * 6 + k] === 1); want.push(l9PicCell(V.pic, rr, k)); }
                if (l9Clue(have).join(",") !== l9Clue(want).join(",")) { ok = false; }
            }
            for (var cc = 0; cc < 6 && ok; cc++) {
                var have2 = []; var want2 = [];
                for (var k2 = 0; k2 < 6; k2++) { have2.push(V.grid[k2 * 6 + cc] === 1); want2.push(l9PicCell(V.pic, k2, cc)); }
                if (l9Clue(have2).join(",") !== l9Clue(want2).join(",")) { ok = false; }
            }
            if (ok) { V.solved = 1; flash(255, 230, 150, 80); l9Say("the picture is complete!  ( > )", 200, 372); }
            return true;
        }
    } else if (V.room === 2 && !V.solved) {
        if (l9SlideHelp.shown && mouseX > 140 && mouseX < 260 && mouseY > 272 && mouseY < 296) { l9SlideHelp.on = 1 - l9SlideHelp.on; return true; }
        var sx = 128; var sy = 92; var SS = 48;
        var c3 = floor((mouseX - sx) / SS); var r3 = floor((mouseY - sy) / SS);
        if (c3 >= 0 && r3 >= 0 && c3 < 3 && r3 < 3) {
            var i3 = r3 * 3 + c3;
            var b = V.tiles.indexOf(-1);
            var br = floor(b / 3); var bc = b % 3;
            if (abs(br - r3) + abs(bc - c3) === 1) {
                V.tiles[b] = V.tiles[i3]; V.tiles[i3] = -1; V.moves++;
                var done = true;
                for (var t = 0; t < 8; t++) { if (V.tiles[t] < 0 || L9_SLIDE_GOAL.charAt(V.tiles[t]) !== L9_SLIDE_GOAL.charAt(t)) { done = false; } }
                if (done) { V.solved = 1; flash(255, 230, 150, 80); l9Say("K E Y H O L E S ! the vault rumbles open.  ( > )", 200, 372); }
            }
            return true;
        }
    } else if (V.room === 3 && !V.solved) { l9VaultKYPressed();
    } else if (V.room === 4 && !V.solved) { l9VaultABCPressed();
    } else if (V.room === 5 && !V.solved) { l9VaultLadderPressed();
    } else if (V.room === 6) {
        l9TresChestPressed();
    }
    return true;
};

var drawLevel9 = function() {
    // if you found the RAIN KEY, it's always in your bag here (even if you skipped ahead with "1")
    if (srHasRainKey && !l9Rain.door && !l9HasItem("rainkey") && l9Held.type !== "rainkey") { l9Inv.push("rainkey"); }
    if (l4KeyGot && !l9Vault.door && !l9HasItem("wordkey") && l9Held.type !== "wordkey") { l9Inv.push("wordkey"); }
    if (l9Scene === 2) { drawL9CurtainCall(); return; }
    if (l9Scene === 6) { drawL9Vault(); }
    else if (l9Scene === 7) { drawL9TresRoom(); }
    else if (l9Scene === 4) { drawL9Attic(); }
    else if (l9Scene === 5) { drawL9GuppyRoom(); }
    else if (l9Scene === 0) { drawL9EndCard(); drawL9RainDoor(); drawL9VaultDoor(); }
    else if (l9Scene === 1) { drawL9Backstage(); }
    else { drawL9Stage(); drawL9RainStage(); drawL9TresStage(); }
    if (l9Fox.state === "gone" && l9MarkWith("fox") < 0) {
        var fm = l9FreeMark(false);
        if (fm >= 0) { l9Marks[fm].item = "fox"; l9Fox.state = "onstage"; }
    }
    // the duck's squeak pattern
    if (l9Squeak.t >= 0) {
        for (var sq = 0; sq < L9_SQUEAKS.length; sq++) {
            if (l9Squeak.t === L9_SQUEAKS[sq]) {
                l9Bubbles.push({x: l9Squeak.x + random(-10, 10), y: l9Squeak.y - 14, t: 40});
                burst(l9Squeak.x, l9Squeak.y - 8, 255, 230, 80, 4, 1.5, 0);
            }
        }
        l9Squeak.t++;
        if (l9Squeak.t > 160) {
            if (l9Squeak.onStage && l9Rex.state === "bone" && !l9RexStage.on) {
                var free = l9FreeMark(false);
                if (free >= 0) {
                    l9RexStage = {on: 1, x: -40, mark: free};
                    l9Marks[free].item = "rex";
                    l9Say("Rex heard his duck!! here he comes!", 200, 200);
                }
            }
            l9Squeak.t = -1;
        }
    }
    for (var bb = l9Bubbles.length - 1; bb >= 0; bb--) {
        var B = l9Bubbles[bb];
        B.t--; B.y -= 0.6;
        fill(255, 240, 120, B.t * 6); textSize(10); textAlign(CENTER); text("squeak!", B.x, B.y);
        if (B.t <= 0) { l9Bubbles.splice(bb, 1); }
    }
    // Rex and the duck
    if (l9Scene === 1) {
        var heldDuck = l9Held.type === "duck";
        if (heldDuck && frameCount % 24 === 0) {
            l9Say("squeak!", l9Held.x, l9Held.y - 16);
        }
        if (l9Rex.state === "asleep" && heldDuck && (l9Lit || l9Power) && dist(l9Held.x, l9Held.y, l9Rex.x + 26, l9Rex.y) < 120) {
            l9Rex.state = "awake";
            l9Say("!!! (Rex LOVES that duck)", l9Rex.x + 20, l9Rex.y - 40);
        }
        if (l9Rex.state === "awake" || l9Rex.state === "walking" || l9Rex.state === "chewing") {
            if (l9Rex.state === "chewing" && !heldDuck && l9Duck.on) {
                l9Duck.x = l9Rex.x + l9Rex.face * 22;
            }
            var tx = -1;
            if (heldDuck) { tx = l9Held.x; } else if (l9Duck.on) { tx = l9Duck.x; }
            if (tx >= 0) {
                tx = constrain(tx - 20 * (tx > l9Rex.x ? 1 : -1), 40, 360);
                if (abs(tx - l9Rex.x) > 4) {
                    l9Rex.face = tx > l9Rex.x ? 1 : -1;
                    l9Rex.x += l9Rex.face * 2.2;
                    l9Rex.state = "walking";
                } else if (l9Duck.on && !heldDuck) {
                    if (l9Rex.state !== "chewing") { l9Say("*squeak squeak squeak*", l9Rex.x, l9Rex.y - 40); }
                    l9Rex.state = "chewing";
                } else {
                    l9Rex.state = "awake";
                }
            }
        }
    }
    // pulling the lever
    if (l9Lever.held) {
        l9Lever.ang = constrain(-40 + (mouseY - 270) * 1.2, -40, 40);
        if (l9Lever.ang >= 40) {
            l9Lever.held = 0;
            if (l9Power) {
                if (!l9StageOpen) { l9StageOpen = 1; l9CurtainT = 0; }
                l9Scene = 3;
                shake(8); flash(255, 240, 200, 120);
                l9Say("the curtain is up! ...but where is everyone??", 200, 200);
            } else {
                shake(3);
                l9Say("*CLUNK* ...nothing. no power.", L9_LEVER_X, 250);
            }
        }
    } else if (l9Lever.ang > -40) {
        l9Lever.ang = max(-40, l9Lever.ang - 4);
    }
    if (l9Vend.plugHeld) { l9Vend.plugX = mouseX; l9Vend.plugY = mouseY; }
    l9TresScrub();
    if (!l9Rope.held) { l9Rope.x = l9Rope.x * 0.8; }
    // the curtain rope
    if (l9Rope.held) {
        l9Rope.y = constrain(mouseY - 242, -70, 90);
        l9Rope.x = constrain(mouseX - 352, -12, 40);
    } else if (l9Rope.y > 0) {
        l9Rope.y = max(0, l9Rope.y - 6);
    } else if (l9Rope.y < 0) {
        l9Rope.y = min(0, l9Rope.y + 6);
    }
    if (l9Scene === 0 && l9Keypad.open) { drawL9Keypad(); }
    if (l9Scene === 3 && l9Vend.keypad) { drawL9VendPad(); }
    // vending machine: a normal purchase (it gets stuck, of course)
    if (l9Vend.vslot !== "") {
        l9Vend.vt++;
        if (l9Vend.vt === 1) { l9Vend.msg = "VENDING..."; }
        if (l9Vend.vt === 50) { l9Vend.msg = "STUCK"; }
        if (l9Vend.vt === 90) { l9Vend.msg = "RETURNING COIN"; }
        if (l9Vend.vt === 130) {
            l9Vend.credit = 0; l9Inv.push("coin"); l9Vend.msg = "INSERT COIN"; l9Vend.vslot = ""; l9Vend.vt = 0;
            l9Say("*ptooey* (your coin comes back)", 200, 340);
        }
    }
    // vending machine: test mode, everything comes out
    if (l9Vend.dumped && l9Vend.hop === 0) {
        l9Vend.dumpT++;
        if (l9Vend.dumpT < 70 && l9Vend.dumpT % 3 === 0) {
            var cols = [[230, 60, 50], [250, 190, 40], [60, 140, 230], [120, 200, 80], [200, 90, 200], [250, 130, 40]];
            var cc = cols[floor(random(0, 6))];
            l9Snacks.push({x: L9_VEND_X + 10, y: L9_VEND_Y - 30, vx: random(-2.5, 3.5), vy: random(-6, -2), ty: random(312, 326), r: cc[0], g: cc[1], b: cc[2], rot: random(-50, 50)});
        }
        if (l9Vend.dumpT === 72) {
            l9Seed = {on: 1, x: 205, y: 322};
            burst(205, 322, 220, 190, 120, 12, 2, 0.1);
            l9Say("...and a bag of BIRD SEED?", 205, 300);
        }
        if (l9Vend.dumpT === 95) {
            l9Celery = {on: 1, x: 150, y: 322};
            burst(150, 322, 120, 200, 90, 10, 2, 0.1);
            l9Say("...and some DIET CELERY??", 150, 300);
        }
        if (l9Vend.dumpT === 150) {
            var vm = l9FreeMark(true);
            if (vm >= 0) {
                l9Marks[vm].item = "vend"; l9Vend.hop = 1; l9Vend.hopT = 0;
                l9Say("the vending machine feels so light! it hops onto the stage!", 200, 150);
            }
        }
    }
    drawL9Inventory();
    if (l9Held.type !== "") { drawL9Item(l9Held.type, l9Held.x, l9Held.y); }
    drawL9Says();
};

var level9MousePressed = function() {
    if (l9Scene === 2) {
        if (l9EncorePressed()) { return; }
        var xs = [28, 74, 122, 166, 206, 248, 300, 360];
        if (dist(mouseX, mouseY, 200, 225) < 34) { l9Bows[8] = 40; l9Say("ROOOAR (thank you)", 200, 190); l9EncoreBow(8); return; }
        for (var c = 0; c < 8; c++) {
            if (abs(mouseX - xs[c]) < 22 && mouseY > 205 && mouseY < 310) { l9Bows[c] = 30; l9EncoreBow(c); return; }
        }
        return;
    }
    // the door keypad
    if (l9Scene === 0 && l9Keypad.open) {
        if (mouseX < 130 || mouseX > 270 || mouseY < 96 || mouseY > 310) { l9Keypad.open = 0; return; }
        var labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"];
        for (var kb = 0; kb < 12; kb++) {
            var kbx = 146 + (kb % 3) * 38; var kby = 148 + floor(kb / 3) * 36;
            if (mouseX >= kbx && mouseX <= kbx + 32 && mouseY >= kby && mouseY <= kby + 28) {
                var Lb = labels[kb]; l9Keypad.msgT = 0;
                if (Lb === "C") { l9Keypad.entry = ""; }
                else if (Lb === "OK") {
                    if (l9Keypad.entry === L9_CODE) {
                        l9Keypad.msg = "OPEN"; l9Keypad.msgT = 30; l9Keypad.open = 0;
                        l9Door.open = 1;
                        l9Say("*click* *click* the door swings open", L9_DOOR_X - 20, L9_DOOR_Y - 8);
                        burst(L9_DOOR_X + 14, L9_DOOR_Y + 24, 255, 220, 150, 20, 2.5, 0);
                    } else {
                        l9Keypad.msg = "WRONG"; l9Keypad.msgT = 40; l9Keypad.entry = ""; shake(3);
                    }
                } else if (l9Keypad.entry.length < 3) { l9Keypad.entry += Lb; }
                return;
            }
        }
        return;
    }
    // the cast list
    if (l9Scene === 3 && l9Clip) { l9Clip = 0; return; }
    // vending machine keypad
    if (l9Scene === 3 && l9Vend.keypad) {
        if (mouseX < 120 || mouseX > 280 || mouseY < 90 || mouseY > 310) { l9Vend.keypad = 0; return; }
        var vkeys = ["A", "B", "C", "D", "1", "2", "3", "4"];
        for (var vb = 0; vb < 8; vb++) {
            var vbx = vb < 4 ? 150 : 210; var vby = 152 + (vb % 4) * 32;
            if (mouseX >= vbx && mouseX <= vbx + 40 && mouseY >= vby && mouseY <= vby + 26) {
                if (l9Vend.vslot !== "" || l9Vend.dumped) { return; }
                if (!l9Vend.credit) { l9Vend.msg = "INSERT COIN"; l9Vend.entry = ""; return; }
                if (vb < 4) { l9Vend.entry = vkeys[vb]; return; }
                if (l9Vend.entry === "") { l9Vend.msg = "LETTER FIRST"; return; }
                var pair = l9Vend.entry + vkeys[vb]; l9Vend.entry = "";
                l9Vend.seq.push(pair);
                var pre = true;
                for (var q = 0; q < l9Vend.seq.length; q++) { if (l9Vend.seq[q] !== L9_VCODE[q]) { pre = false; } }
                if (pre && l9Vend.seq.length === 4) {
                    l9Vend.dumped = 1; l9Vend.dumpT = 0; l9Vend.credit = 0; l9Vend.keypad = 0; l9Vend.msg = "TEST MODE!!";
                    shake(6); flash(255, 255, 200, 60);
                } else if (pre) {
                    l9Vend.msg = l9Vend.seq.join(" ") + " ...";
                } else {
                    l9Vend.seq = []; l9Vend.vslot = pair; l9Vend.vt = 0;
                }
                return;
            }
        }
        return;
    }
    for (var i = 0; i < l9Inv.length; i++) {
        if (abs(mouseX - l9SlotX(i)) < 19 && mouseY > 362 && mouseY < 392) {
            l9Held = {type: l9Inv[i], x: mouseX, y: mouseY};
            l9Press = {x: mouseX, y: mouseY, slot: i};
            return;
        }
    }
    if (l9VaultPressed()) { return; }
    if (l9TresPressed()) { return; }
    if (l9RainPressed()) { return; }
    if (l9Scene === 3) {
        if (mouseX < 30 && abs(mouseY - 150) < 30) { l9Scene = 1; return; }
        // the vending machine's plug
        if (!l9Vend.plugged && l9Vend.hop === 0 && dist(mouseX, mouseY, l9Vend.plugX, l9Vend.plugY) < 12) { l9Vend.plugHeld = 1; return; }
        // the vending machine itself
        if (l9Vend.hop === 0 && mouseX > L9_VEND_X - 30 && mouseX < L9_VEND_X + 30 && mouseY > L9_VEND_Y - 80 && mouseY < L9_VEND_Y) {
            if (l9Vend.dumped) { l9Say("it's empty. (and very happy about it)", L9_VEND_X, 160); }
            else if (!l9Vend.plugged) { l9Say("it's ON BREAK. (and unplugged)", L9_VEND_X + 20, 160); }
            else if (!l9Power) { l9Say("no power", L9_VEND_X, 160); }
            else { l9Vend.keypad = 1; if (!l9Vend.credit) { l9Vend.msg = "INSERT COIN"; } else { l9Vend.msg = "PICK A SNACK"; } }
            return;
        }
        // the bird seed bag / the celery on the floor
        if (l9Seed.on && dist(mouseX, mouseY, l9Seed.x, l9Seed.y) < 14) { l9Seed.on = 0; l9Inv.push("seed"); return; }
        if (l9Celery.on && dist(mouseX, mouseY, l9Celery.x, l9Celery.y) < 14) { l9Celery.on = 0; l9Inv.push("celery"); return; }
        // the trapdoor
        if (l9Beast.state === "under" && l9Marks[5].item === "" && abs(mouseX - L9_TRAP_X) < 28 && abs(mouseY - L9_TRAP_Y) < 9) {
            l9Say("something BIG is down there. it sounds hungry. ...but picky.", 200, 230);
            shake(2);
            return;
        }
        // the bird up top
        if (l9Bird.state === "rafters" && dist(mouseX, mouseY, 150, 24) < 20) { l9Say("tweet. (it won't come down)", 150, 60); return; }
        if (mouseX > 50 && mouseX < 82 && mouseY > 260 && mouseY < 286) { l9Clip = 1; return; }
        if (dist(mouseX, mouseY, 352 + l9Rope.x, 242 + l9Rope.y) < 16) { l9Rope.held = 1; return; }
        var dm = l9MarkWith("duck");
        if (dm >= 0 && dist(mouseX, mouseY, l9Marks[dm].x, l9Marks[dm].y - 14) < 20) { l9StartSqueak(l9Marks[dm].x, l9Marks[dm].y - 24, 1); return; }
        for (var cm = 0; cm < l9Marks.length; cm++) {
            if (l9Marks[cm].item !== "" && l9Marks[cm].item !== "rex" && abs(mouseX - l9Marks[cm].x) < 20 && mouseY > l9Marks[cm].y - 90 && mouseY < l9Marks[cm].y + 6) {
                l9Say("*takes a little bow*", l9Marks[cm].x, 200);
                return;
            }
        }
        if (mouseY > 340) { l9Say("shhh! (the audience is watching)", 200, 330); }
        return;
    }
    if (l9Scene === 0) {
        if (abs(mouseX - 200) < 70 && abs(mouseY - 99) < 10) {
            l9Promise = (l9Promise + 1) % 4;
            return;
        }
        for (var k = 0; k < l9Credits.length; k++) {
            var it = l9Credits[k][2];
            if (it === "" || l9Taken[it] || (it === "gem" && !l9Rain.door)) { continue; }
            var p = l9CreditItemPos(k);
            if (p && dist(mouseX, mouseY, p[0], p[1]) < 16) {
                if (it === "nobatteries") {
                    l9Say("sorry. batteries NOT INCLUDED.", p[0] - 40, p[1] - 12);
                    return;
                }
                l9Taken[it] = 1; l9Inv.push(it);
                burst(p[0], p[1], 255, 240, 180, 14, 2.5, 0);
                return;
            }
        }
        if (mouseX > L9_DOOR_X && mouseX < L9_DOOR_X + 28 && mouseY > L9_DOOR_Y && mouseY < L9_DOOR_Y + 48) {
            if (l9Door.open) { l9Scene = 1; return; }
            if (!l9Door.locked) { l9Keypad.open = 1; l9Keypad.entry = ""; l9Keypad.msgT = 0; return; }
            l9Door.rattle = 20;
            l9Say("*rattle* (locked)", L9_DOOR_X - 10, L9_DOOR_Y - 8);
            return;
        }
        if (abs(mouseX - 200) < 120 && mouseY > 40 && mouseY < 86) {
            l9Say("it's the end. go home.", 200, 40);
        }
        return;
    }
    // ---- backstage ----
    if (mouseX < 30 && abs(mouseY - 200) < 30) { l9Scene = 0; return; }
    if (l9StageOpen && mouseX > 372 && abs(mouseY - 206) < 28) { l9Scene = 3; return; }
    if (mouseX > 30 && mouseX < 90 && mouseY > 30 && mouseY < 54) {
        if (l9Exit.batteries) {
            l9Exit.batteries = 0;
            l9Inv.push("batteries");
            l9Say("the EXIT sign runs on batteries?? ...now it's REALLY dark.", 200, 80);
        } else {
            l9Say("it's just a sign. (with no batteries)", 120, 80);
        }
        return;
    }
    if (!l9Lit && !l9Power) { return; }
    // the fox behind the moon
    if (l9Fox.state === "hiding" && (dist(mouseX, mouseY, 192, 106) < 18 || dist(mouseX, mouseY, 164, 66) < 12)) {
        l9Say("the fox won't come out. it's still upset about level 2.", 200, 140);
        return;
    }
    // take the costume / the plush
    if (l9Costume.taken && !l9Rain.hanger && mouseX > 48 && mouseX < 92 && mouseY > 100 && mouseY < 132) {
        l9Rain.hanger = 1; l9Inv.push("hanger");
        l9Say("you take the wire coat hanger. it's good for hooking stuff.", 120, 110);
        return;
    }
    if (!l9Costume.taken && mouseX > 40 && mouseX < 104 && mouseY > 118 && mouseY < 240) {
        l9Costume.taken = 1; l9Inv.push("costume");
        l9Say("you take the werewolf costume. it's itchy.", 120, 110);
        return;
    }
    if (!l9Plush.taken && dist(mouseX, mouseY, 262, 352) < 18) {
        l9Plush.taken = 1; l9Inv.push("plush");
        l9Say("*squish*", 262, 330);
        return;
    }
    // fuse box
    if (mouseX > 338 && mouseX < 388 && mouseY > 118 && mouseY < 172) {
        if (!l9Fuse.inBox) { l9Fuse.open = 1 - l9Fuse.open; }
        if (l9Fuse.open && !l9Fuse.inBox) { l9Say("an empty fuse slot.", 330, 112); }
        return;
    }
    // letters in the crate
    for (var li = 0; li < l9Letters.length; li++) {
        var L = l9Letters[li];
        if (!L.out && dist(mouseX, mouseY, L.x, L.y) < 14) {
            L.out = 1; L.vx = random(-4, -1.5); L.vy = -7;
            l9Say(["one less E", "N-ope", "D-one"][li], L.x, L.y - 20);
            return;
        }
    }
    if (l9LettersOut() === 3 && !l9Fuse.found && dist(mouseX, mouseY, 336, 280) < 16) {
        l9Fuse.found = 1; l9Inv.push("fuse");
        burst(336, 280, 200, 230, 255, 12, 2, 0);
        return;
    }
    // duck on the floor
    if (l9Duck.on && dist(mouseX, mouseY, l9Duck.x, 356) < 18) {
        if (l9Rex.state === "chewing") {
            l9Say("GRRR! (Rex will NOT let go of his duck)", l9Rex.x, l9Rex.y - 40);
            return;
        }
        l9Duck.on = 0; l9Inv.push("duck");
        l9Held = {type: "duck", x: mouseX, y: mouseY};
        l9Press = {x: mouseX, y: mouseY, slot: -2};
        return;
    }
    // the lever
    var kx = L9_LEVER_X + sin(l9Lever.ang) * 46; var ky = L9_LEVER_Y - cos(l9Lever.ang) * 46;
    if (dist(mouseX, mouseY, kx, ky) < 14) {
        if (l9RexBlocking()) {
            if (l9Rex.state === "asleep") { l9Say("Rex is asleep on the lever. He is VERY heavy.", 200, 200); }
            else { l9Say("Rex is in the way.", 200, 200); }
        } else {
            l9Lever.held = 1;
        }
        return;
    }
    if (dist(mouseX, mouseY, l9Rex.x + 10, l9Rex.y) < 34) {
        if (l9Rex.state === "asleep") { l9Say("zzz... (he won't budge)", l9Rex.x, l9Rex.y - 34); }
        else { l9Say("good boy!", l9Rex.x, l9Rex.y - 40); }
    }
};

var level9MouseDragged = function() {
    if (l9Held.type !== "") { l9Held.x = mouseX; l9Held.y = mouseY; }
    if (l9Vend.plugHeld) { l9Vend.plugX = mouseX; l9Vend.plugY = mouseY; }
};

var level9MouseReleased = function() {
    if (l9RainReleased()) { return; }
    l9Lever.held = 0;
    if (l9Vend.plugHeld) {
        l9Vend.plugHeld = 0;
        l9Vend.plugX = mouseX; l9Vend.plugY = mouseY;
        if (dist(l9Vend.plugX, l9Vend.plugY, L9_OUTLET_X, L9_OUTLET_Y) < 16) {
            l9Vend.plugged = 1;
            if (l9Power) { l9Say("BREAK'S OVER! (the vending machine wakes up)", 150, 160); l9Vend.msg = "INSERT COIN"; }
            else { l9Say("plugged in... but there's no power", 150, 160); }
            burst(L9_OUTLET_X, L9_OUTLET_Y, 255, 240, 150, 10, 2, 0);
        } else {
            l9Vend.plugX = constrain(l9Vend.plugX, 40, 360); l9Vend.plugY = constrain(l9Vend.plugY, 200, 326);
        }
        return;
    }
    if (l9Rope.held) {
        l9Rope.held = 0;
        if (l9Rope.y < -50 && l9CastReady() && !l9Rain.hole) {
            l9Rain.hole = 1;
            shake(10); flash(255, 240, 200, 60);
            burst(300, 26, 120, 90, 60, 30, 3, 0.15);
            l9Say("you yanked the rope UP... and ripped a hole in the ceiling!!", 200, 160);
            return;
        }
        if (l9Rope.y < 50 && l9Rope.x > 28) { l9TresRopeRight(); return; }
        if (l9Rope.y > 70) {
            if (l9CastReady() && l9Rain.fishOn) {
                level = 98;
                shake(8);
            } else if (l9CastReady() && l9Tres.onStage) {
                level = TRES_LEVEL;
                shake(8);
            } else if (l9CastReady()) {
                l9Scene = 2; l9T = 0;
                shake(8); flash(255, 240, 200, 120);
            } else {
                l9Say("you can't close the curtain yet! the cast isn't ready.", 200, 200);
            }
        }
        return;
    }
    var h = l9Held.type;
    if (h === "") { return; }
    l9Held = {type: "", x: 0, y: 0};
    // picked the duck up off the floor with a plain click: it goes in your bag
    if (l9Press.slot === -2) {
        l9Press.slot = -1;
        if (dist(mouseX, mouseY, l9Press.x, l9Press.y) < 4) { return; }
    }
    // just clicked an item in your bag (didn't drag it)
    if (dist(mouseX, mouseY, l9Press.x, l9Press.y) < 4 && l9Press.slot >= 0) {
        var pslot = l9Press.slot;
        l9Press.slot = -1;
        if (h === "duck") { l9StartSqueak(l9SlotX(pslot), 362, 0); }
        else {
            var looks = {key: "a brass key", flashlight: l9Powered ? "a working flashlight" : "a flashlight (no batteries)",
                batteries: "two AA batteries", sandwich: "a veggie sandwich. (ew)", fuse: "a glass fuse",
                bone: "a bone. (the Altar Beast won't miss it)", costume: "a very itchy werewolf costume", plush: "a squishy monster plush",
                coin: "25 cents. the whole budget.", seed: "a bag of bird seed", celery: "diet celery. yum?",
                rainkey: "the RAIN KEY. (it's a little wet)", hanger: "a wire coat hanger", gem: "a RAIN GEM. it's cold and shiny.", wordkey: "the KEY. made out of the letters K, E and Y.", bulb: "a spare light bulb (it works!)", guppy: "the rain guppy. blub.", fish: "THE STORM FISH. *bzzzt*",
                tres: "TRES. a blob made of treasure. (blorp)", tres2: "evolved TRES. he looks so cool.", duster: "a feather duster", hoard: "THE PERFECT HOARD. (a bag of perfectly stacked coins)"};
            l9Say(looks[h] || h, 160, 350);
        }
        return;
    }
    // combine in the inventory
    for (var i = 0; i < l9Inv.length; i++) {
        if (abs(mouseX - l9SlotX(i)) < 19 && mouseY > 360 && mouseY < 394 && l9Inv[i] !== h) {
            var other = l9Inv[i];
            if ((h === "batteries" && other === "flashlight") || (h === "flashlight" && other === "batteries")) {
                l9RemoveItem("batteries"); l9Powered = 1;
                l9Say("*click* it works!", 120, 350);
                burst(mouseX, mouseY, 255, 240, 150, 14, 2, 0);
            } else {
                l9Say("those don't go together", 120, 350);
            }
            return;
        }
    }
    if (h === "wordkey") {
        if (l9Scene === 0 && !l9Vault.door && l9VInDoor(mouseX, mouseY)) {
            l9RemoveItem("wordkey"); l9Vault.door = 1;
            flash(255, 220, 120, 90); shake(3);
            burst(L9_VDOOR_X + 14, L9_VDOOR_Y + 24, 255, 220, 120, 24, 2.5, 0.05);
            l9Say("the KEY fits! the little door creaks open...", 150, 90);
        } else if (mouseY <= 356) {
            l9Say("the KEY from level 4. (it still says K E Y on it)", 200, 340);
        }
        return;
    }
    if (mouseY <= 356 && l9TresDropped(h)) { return; }
    if (mouseY <= 356 && l9RainDropped(h)) { return; }
    if (l9Scene === 0) {
        if (h === "key" && l9Door.locked && mouseX > L9_DOOR_X - 10 && mouseX < L9_DOOR_X + 38 && mouseY > L9_DOOR_Y - 10 && mouseY < L9_DOOR_Y + 58) {
            l9RemoveItem("key");
            l9Door.locked = 0;
            l9Say("*click* ...the lock opens. but there's a keypad too??", L9_DOOR_X - 60, L9_DOOR_Y - 8);
            burst(L9_DOOR_X + 14, L9_DOOR_Y + 24, 255, 220, 150, 20, 2.5, 0);
        } else if (h === "sandwich" && mouseY < 356) {
            l9Say("nobody out here wants a sandwich", 200, 360);
        }
        return;
    }
    if (mouseY > 356) { return; }
    // ---- on stage ----
    if (l9Scene === 3) {
        if (h === "coin") {
            if (l9Vend.hop === 0 && mouseX > L9_VEND_X - 30 && mouseX < L9_VEND_X + 30 && mouseY > L9_VEND_Y - 80 && mouseY < L9_VEND_Y) {
                if (!l9Vend.plugged || !l9Power) { l9Say("it's ON BREAK.", L9_VEND_X + 20, 160); return; }
                if (l9Vend.dumped) { l9Say("it's empty", L9_VEND_X, 160); return; }
                l9RemoveItem("coin"); l9Vend.credit = 1; l9Vend.msg = "PICK A SNACK";
                l9Say("*clink*", L9_VEND_X, 160);
            } else {
                l9Say("the audience doesn't take tips", 200, 240);
            }
            return;
        }
        if (h === "celery") {
            if (l9Beast.state === "under" && abs(mouseX - L9_TRAP_X) < 34 && abs(mouseY - L9_TRAP_Y) < 22) {
                l9RemoveItem("celery");
                l9Beast.state = "rising"; l9Beast.t = 0;
                shake(8); flash(160, 60, 220, 70);
                burst(L9_TRAP_X, L9_TRAP_Y, 160, 120, 90, 30, 3.5, 0.15);
                l9Say("*CRUNCH* ...the trapdoor bursts open!", L9_TRAP_X, 200);
            } else {
                l9Say("this is diet food. who's on a diet?", 200, 240);
            }
            return;
        }
        if (h === "seed") {
            var sm = l9MarkAt(mouseX, mouseY);
            if (sm >= 0 && l9Bird.state === "rafters") {
                l9RemoveItem("seed");
                l9Marks[sm].item = "bird"; l9Bird.state = "flying"; l9Bird.t = 0; l9Bird.mark = sm;
                burst(l9Marks[sm].x, l9Marks[sm].y, 220, 190, 120, 14, 2, 0.1);
                l9Say("*sprinkle sprinkle*  ...tweet?!", l9Marks[sm].x, 200);
            } else {
                l9Say("sprinkle it on an empty X", 200, 240);
            }
            return;
        }
        if (h === "costume" || h === "plush" || h === "duck") {
            var mk = l9MarkAt(mouseX, mouseY);
            if (mk >= 0) {
                l9Marks[mk].item = h; l9RemoveItem(h);
                burst(l9Marks[mk].x, l9Marks[mk].y - 10, 255, 230, 150, 12, 2, 0);
                l9Say(h === "costume" ? "the werewolf (costume) takes its place" : (h === "plush" ? "the purple monster (plush) takes its place" : "the duck takes its place"), l9Marks[mk].x, 200);
                return;
            }
            l9Say("put the cast on the X's", 200, 240);
        } else if (h === "sandwich") {
            l9Say("the audience doesn't want a sandwich either", 200, 240);
        } else {
            l9Say("that's not part of the cast", 200, 240);
        }
        return;
    }
    if (h === "flashlight") {
        if (!l9Powered) {
            l9Say("*click* ...nothing. it's dead.", mouseX, mouseY - 10);
        } else {
            l9RemoveItem("flashlight");
            l9Lit = 1; l9LampX = constrain(mouseX, 60, 340);
            flash(255, 240, 180, 60);
        }
        return;
    }
    if (!l9Lit && !l9Power) { l9Say("too dark to see anything", 200, 200); return; }
    if (h === "sandwich") {
        if (l9Fox.state === "hiding" && dist(mouseX, mouseY, 172, 100) < 50) {
            l9RemoveItem("sandwich");
            l9Fox.state = "eating"; l9Fox.t = 0;
            l9Say("the fox accepts your apology sandwich.", 200, 140);
            return;
        }
        if (dist(mouseX, mouseY, l9Rex.x + 20, l9Rex.y) < 60) {
            if (l9Rex.state === "asleep") { l9Say("*sniff* ...veggie? he goes back to sleep.", l9Rex.x, l9Rex.y - 40); }
            else { l9Say("Rex does not want a veggie sandwich.", l9Rex.x, l9Rex.y - 40); }
        } else {
            l9Say("nobody here wants this sandwich", mouseX, mouseY - 10);
        }
        return;
    }
    if (h === "duck") {
        l9RemoveItem("duck");
        l9Duck.on = 1; l9Duck.x = constrain(mouseX, 40, 360);
        return;
    }
    if (h === "bone") {
        if (dist(mouseX, mouseY, l9Rex.x + 20, l9Rex.y) < 70) {
            if (l9Rex.state === "chewing") {
                l9RemoveItem("bone");
                l9Rex.state = "bone";
                l9Duck.x = l9Rex.x - l9Rex.face * 40;
                l9Say("Rex drops the duck for the bone! (good trade)", l9Rex.x, l9Rex.y - 40);
            } else if (l9Rex.state === "asleep") {
                l9Say("*sniff* ...he's too sleepy for a bone.", l9Rex.x, l9Rex.y - 40);
            } else {
                l9Say("he only has eyes for the duck right now", l9Rex.x, l9Rex.y - 40);
            }
        } else {
            l9Say("who would want a bone?", mouseX, mouseY - 10);
        }
        return;
    }
    if (h === "costume" || h === "plush") {
        l9Say("that belongs on stage", mouseX, mouseY - 10);
        return;
    }
    if (h === "fuse") {
        if (mouseX > 338 && mouseX < 388 && mouseY > 118 && mouseY < 172) {
            if (!l9Fuse.open) { l9Say("the fuse box is closed", 330, 112); return; }
            l9RemoveItem("fuse");
            l9Fuse.inBox = 1; l9Power = 1;
            shake(5); flash(255, 240, 180, 90);
            burst(370, 146, 255, 230, 120, 24, 3, 0.05);
            l9Say("*BZZT* the power is back on!", 300, 112);
        }
        return;
    }
};

// ============ LEVEL 8 - STUCK INSIDE THE CODE ============
var L8_TOP = 50;       // first code line
var L8_LH = 15;        // line height
var L8_X = 34;         // code starts here (after line numbers)
var l8Phase = 0;       // 0 loading, 1 error popup, 2 sucked in, 3 code, 4 compiling, 5 door
var l8T = 0;
var l8Load = 0;
var l8DoorOpen = 0;    // "locked" -> "open"
var l8OpenTaken = 0;   // the word "open" got pulled out of the comment
var l8Name = [];       // letters of the misspelled function name
var l8SpeedFixed = 0;
var l8LoopFixed = 0;
var l8Console = [];
var l8Snacks = 48203;
var l8ErrLine = -1;
var l8ErrFlash = 0;
var l8Drag = {id: "", txt: "", x: 0, y: 0, ox: 0, oy: 0, col: [0, 0, 0]};
var l8Hits = [];
var l8Nope = {x: 0, y: 0, t: 0};
var l8Runs = 0;
var l8Rain = [];

var initLevel8 = function() {
    l8Phase = 0; l8T = 0; l8Load = 0;
    l8DoorOpen = 0; l8OpenTaken = 0;
    l8Name = "walkThruogh".split("");
    l8SpeedFixed = 0; l8LoopFixed = 0;
    l8Console = ["> ready. press RUN to start level 8"];
    l8Snacks = 48203; l8ErrLine = -1; l8ErrFlash = 0;
    l8Drag = {id: "", txt: "", x: 0, y: 0, ox: 0, oy: 0, col: [0, 0, 0]};
    l8Hits = []; l8Nope = {x: 0, y: 0, t: 0}; l8Runs = 0;
    l8Rain = [];
    for (var i = 0; i < 40; i++) { l8Rain.push({x: random(0, 400), y: random(-400, 0), v: random(4, 10), c: floor(random(0, 3))}); }
};
initLevel8();

// colours
var L8_KW = [200, 120, 255];
var L8_STR = [230, 190, 110];
var L8_COM = [110, 140, 110];
var L8_FN = [110, 200, 230];
var L8_TXT = [220, 220, 230];
var L8_NUM = [140, 200, 255];

// builds the code from the current state: each line is a list of [text, colour, id]
var l8Code = function() {
    var name = [];
    for (var i = 0; i < l8Name.length; i++) { name.push([l8Name[i], L8_FN, "L" + i]); }
    var L = [];
    L.push([["// LEVEL 8  (please do not look in here)", L8_COM, ""]]);
    L.push([["var ", L8_KW, ""], ["door", L8_TXT, ""], [" = ", L8_TXT, ""], [l8DoorOpen ? "\"open\"" : "\"locked\"", L8_STR, l8DoorOpen ? "" : "locked"], [";", L8_TXT, ""]]);
    L.push([["var ", L8_KW, ""], ["hungry", L8_TXT, "hungry"], [" = ", L8_TXT, ""], ["false", L8_NUM, ""], [";", L8_TXT, ""]]);
    if (l8OpenTaken) { L.push([["// TODO:      the door", L8_COM, ""]]); }
    else { L.push([["// TODO: ", L8_COM, ""], ["open", L8_COM, "open"], [" the door", L8_COM, ""]]); }
    L.push([]);
    L.push([["var ", L8_KW, ""]].concat(name).concat([[" = ", L8_TXT, ""], ["function", L8_KW, ""], ["() {", L8_TXT, ""]]));
    if (l8SpeedFixed) {
        L.push([["    // player.speed = 0;", L8_COM, ""]]);
        L.push([["    ", L8_TXT, ""], ["player.speed", L8_TXT, ""], [" = ", L8_TXT, ""], ["5", L8_NUM, ""], [";", L8_TXT, ""]]);
    } else {
        L.push([["    ", L8_TXT, "line7"], ["player.speed", L8_TXT, "line7"], [" = ", L8_TXT, "line7"], ["0", L8_NUM, "line7"], [";", L8_TXT, "line7"]]);
        L.push([["    ", L8_TXT, ""], ["//", L8_COM, "slash"], [" player.speed = 5;", L8_COM, ""]]);
    }
    L.push([["    ", L8_TXT, ""], ["while", L8_KW, ""], [" (", L8_TXT, ""], [l8LoopFixed ? "hungry" : "true", l8LoopFixed ? L8_TXT : L8_NUM, l8LoopFixed ? "" : "true"], [") {", L8_TXT, ""]]);
    L.push([["        ", L8_TXT, ""], ["eatSnack", L8_FN, ""], ["();", L8_TXT, ""]]);
    L.push([["    }", L8_TXT, ""]]);
    L.push([["    ", L8_TXT, ""], ["goTo", L8_FN, ""], ["(", L8_TXT, ""], ["\"level 9\"", L8_STR, ""], [");", L8_TXT, ""]]);
    L.push([["};", L8_TXT, ""]]);
    L.push([]);
    L.push([["if", L8_KW, ""], [" (door === ", L8_TXT, ""], ["\"open\"", L8_STR, ""], [") {", L8_TXT, ""]]);
    L.push([["    ", L8_TXT, ""], ["walkThrough", L8_FN, ""], ["();", L8_TXT, ""]]);
    L.push([["}", L8_TXT, ""]]);
    return L;
};

var l8IsDraggable = function(id) {
    return id === "open" || id === "hungry" || id === "slash" || id.charAt(0) === "L";
};

var drawL8Editor = function() {
    background(24, 24, 32);
    noStroke();
    // title bar + tab
    fill(36, 36, 48); rect(0, 0, 400, 30);
    fill(24, 24, 32); rect(8, 8, 84, 22, 4, 4, 0, 0);
    fill(220); textSize(10); textAlign(LEFT); text("level8.js", 18, 23);
    // RUN button
    var hov = mouseX > 326 && mouseX < 392 && mouseY > 5 && mouseY < 25;
    fill(hov ? 70 : 50, hov ? 190 : 160, hov ? 90 : 70); rect(326, 5, 66, 20, 4);
    fill(255); textSize(11); textAlign(CENTER); text("RUN >", 359, 19);
    // gutter
    fill(30, 30, 40); rect(0, 32, 26, 270);
    var lines = l8Code();
    l8Hits = [];
    textSize(11);
    for (var i = 0; i < lines.length; i++) {
        var ly = L8_TOP + i * L8_LH;
        if (l8ErrLine === i && l8ErrFlash > 0) {
            fill(200, 40, 50, 30 + l8ErrFlash * 3); rect(26, ly - 11, 374, L8_LH);
        }
        fill(100, 100, 120); textAlign(RIGHT); text(i + 1, 21, ly);
        textAlign(LEFT);
        var x = L8_X;
        for (var s = 0; s < lines[i].length; s++) {
            var sg = lines[i][s];
            var w = textWidth(sg[0]);
            if (sg[2] !== "") {
                l8Hits.push({id: sg[2], x: x, y: ly - 11, w: w, h: L8_LH, txt: sg[0], col: sg[1]});
                // things you can grab glow a tiny bit when you hover them
                if (l8IsDraggable(sg[2]) && l8Drag.id === "" && mouseX >= x && mouseX <= x + w && mouseY >= ly - 11 && mouseY <= ly + 4) {
                    fill(255, 255, 255, 25); rect(x - 1, ly - 11, w + 2, L8_LH);
                }
            }
            if (l8Drag.id !== "" && sg[2] === l8Drag.id) {
                fill(sg[1][0], sg[1][1], sg[1][2], 60);   // ghost of the word you're holding
            } else {
                fill(sg[1][0], sg[1][1], sg[1][2]);
            }
            text(sg[0], x, ly);
            x += w;
        }
    }
    if (l8ErrFlash > 0) { l8ErrFlash--; }
    // console
    fill(16, 16, 22); rect(0, 304, 400, 96);
    fill(36, 36, 48); rect(0, 304, 400, 14);
    fill(160); textSize(9); textAlign(LEFT); text("CONSOLE", 8, 314);
    for (var c = 0; c < l8Console.length; c++) {
        var ln = l8Console[c];
        if (ln.substring(0, 5) === "ERROR") { fill(255, 100, 100); }
        else if (ln.substring(0, 2) === "OK") { fill(120, 255, 140); }
        else { fill(170, 170, 190); }
        textSize(10);
        text(ln, 8, 334 + c * 14);
    }
    // blinking cursor at the end of the console
    if (frameCount % 50 < 25) { fill(200); rect(8, 334 + l8Console.length * 14 - 9, 6, 11); }
    // the word you're dragging
    if (l8Drag.id !== "") {
        textSize(11);
        var dw = textWidth(l8Drag.txt);
        fill(60, 60, 90, 220); rect(l8Drag.x - 3, l8Drag.y - 12, dw + 6, 16, 3);
        fill(l8Drag.col[0], l8Drag.col[1], l8Drag.col[2]);
        text(l8Drag.txt, l8Drag.x, l8Drag.y);
    }
    // "nope"
    if (l8Nope.t > 0) {
        l8Nope.t--;
        fill(255, 90, 90, l8Nope.t * 8); textSize(11); textAlign(CENTER);
        text("nope", l8Nope.x, l8Nope.y - (30 - l8Nope.t) * 0.5);
    }
};

var l8Run = function() {
    l8Runs++;
    var nameOk = l8Name.join("") === "walkThrough";
    l8Console = ["> running level8.js ... (attempt " + l8Runs + ")"];
    if (!l8DoorOpen) {
        l8Console.push("ERROR (line 15): door is \"locked\".");
        l8Console.push("  You cannot walk through a locked door. Physics.");
        l8ErrLine = 14;
    } else if (!nameOk) {
        l8Console.push("ERROR (line 16): walkThrough is not defined.");
        l8Console.push("  (I only know a \"" + l8Name.join("") + "\". Weird name.)");
        l8ErrLine = 15;
    } else if (!l8SpeedFixed) {
        l8Console.push("ERROR (line 7): player.speed = 0.");
        l8Console.push("  You walked for 3 hours and moved 0 feet.");
        l8ErrLine = 6;
    } else if (!l8LoopFixed) {
        l8Snacks += floor(random(1000, 9000));
        l8Console.push("ERROR (line 9): stuck in a snack loop forever.");
        l8Console.push("  Snacks eaten so far: " + l8Snacks + ". Help.");
        l8ErrLine = 8;
    } else {
        l8Console.push("OK  0 errors. level 8 compiled!");
        l8Console.push("OK  goTo(\"level 9\") ...");
        l8ErrLine = -1;
        l8Phase = 4; l8T = 0;
        flash(120, 255, 140, 60);
        return;
    }
    l8ErrFlash = 40;
    shake(3);
};

var drawLevel8 = function() {
    l8T++;
    noStroke();
    if (l8Phase === 0) {
        // loading... loading... crash
        background(10, 10, 14);
        if (l8Load < 0.64) { l8Load += 0.006; }
        fill(230); textSize(18); textAlign(CENTER);
        text("LOADING LEVEL 8...", 200, 175);
        fill(40); rect(80, 195, 240, 16, 4);
        fill(80, 160, 255); rect(80, 195, 240 * l8Load, 16, 4);
        fill(160); textSize(11); text(floor(l8Load * 100) + "%", 200, 230);
        if (l8T > 130) {
            // glitching
            for (var g = 0; g < 6; g++) {
                fill(random(0, 255), random(0, 255), random(0, 255), 120);
                rect(random(0, 400), random(0, 400), random(20, 160), random(2, 10));
            }
            if (l8T % 6 < 3) { fill(255, 0, 0, 30); rect(0, 0, 400, 400); }
            shake(2);
        }
        if (l8T > 190) { l8Phase = 1; l8T = 0; shake(6); }
    } else if (l8Phase === 1) {
        background(10, 10, 14);
        fill(40); rect(80, 195, 240, 16, 4);
        fill(80, 160, 255); rect(80, 195, 240 * l8Load, 16, 4);
        // error window
        fill(0, 0, 0, 120); rect(64, 124, 280, 150, 6);
        fill(235, 235, 240); rect(60, 120, 280, 150, 6);
        fill(200, 40, 50); rect(60, 120, 280, 24, 6, 6, 0, 0);
        fill(255); textSize(12); textAlign(LEFT); text("level8.js", 70, 137);
        fill(220, 50, 50); ellipse(95, 185, 34, 34);
        fill(255); textSize(22); textAlign(CENTER); text("!", 95, 193);
        fill(30); textSize(15); textAlign(LEFT); text("ERROR", 124, 176);
        textSize(10);
        text("Something went very wrong", 124, 194);
        text("inside the code.", 124, 208);
        var hov = mouseX > 270 && mouseX < 328 && mouseY > 236 && mouseY < 258;
        fill(hov ? 210 : 190); rect(270, 236, 58, 22, 4);
        fill(30); textSize(12); textAlign(CENTER); text("OK", 299, 252);
    } else if (l8Phase === 2) {
        // pulled into the code
        background(6, 10, 8);
        var k = min(1, l8T / 70);
        textSize(12);
        var bits = ["var", "{", "}", "if", "();", "door", "=", "//", "0", "1", "true", "null", ";"];
        for (var i = 0; i < l8Rain.length; i++) {
            var r = l8Rain[i];
            r.y += r.v * (1 + k * 2);
            if (r.y > 420) { r.y = random(-60, -10); r.x = random(0, 400); }
            fill(80, 255, 120, 200);
            text(bits[(i + floor(r.y / 20)) % bits.length], r.x, r.y);
        }
        // the error window shrinking into a dot
        var ws = 1 - k;
        if (ws > 0.02) {
            pushMatrix(); translate(200, 195); scale(ws); rotate(k * 200);
            fill(235, 235, 240); rect(-140, -75, 280, 150, 6);
            fill(200, 40, 50); rect(-140, -75, 280, 24, 6, 6, 0, 0);
            popMatrix();
        }
        if (l8T > 90) { fill(24, 24, 32, (l8T - 90) * 12); rect(0, 0, 400, 400); }
        if (l8T > 110) { l8Phase = 3; l8T = 0; }
    } else if (l8Phase === 3) {
        drawL8Editor();
    } else if (l8Phase === 4) {
        // the code turns green line by line, then falls apart
        drawL8Editor();
        var nLines = 17;
        var done = min(nLines, floor(l8T / 6));
        fill(80, 255, 120, 40);
        for (var j = 0; j < done; j++) { rect(26, L8_TOP + j * L8_LH - 11, 374, L8_LH); }
        if (l8T > 110) {
            var a = min(255, (l8T - 110) * 6);
            fill(255, 255, 255, a); rect(0, 0, 400, 400);
        }
        if (l8T === 112) { shake(8); burst(200, 180, 120, 255, 140, 50, 5, 0.05); }
        if (l8T > 160) { l8Phase = 5; l8T = 0; }
    } else if (l8Phase === 5) {
        // the way out
        background(250, 250, 252);
        fill(0, 0, 0, 10);
        for (var gx = 0; gx < 400; gx += 20) { rect(gx, 0, 1, 400); }
        var op = min(1, l8T / 60);
        fill(30, 30, 40); rect(150, 110, 100, 170, 4);
        fill(255, 240, 180); rect(156, 116, 88 * op, 160);
        fill(120, 80, 40); rect(156 + 88 * op, 116, 88 * (1 - op), 160);
        fill(60, 140, 70); textSize(12); textAlign(CENTER);
        text("goTo(\"level 9\");", 200, 310);
        if (op >= 1) {
            var bob = sin(frameCount * 5) * 5;
            fill(255, 200, 60);
            triangle(222 + bob, 196, 196 + bob, 178, 196 + bob, 214);
            rect(170 + bob, 189, 28, 14);
        }
    }
};

var level8MousePressed = function() {
    if (l8Phase === 1) {
        if (mouseX > 270 && mouseX < 328 && mouseY > 236 && mouseY < 258) {
            l8Phase = 2; l8T = 0; shake(10); flash(255, 255, 255, 120);
        }
        return;
    }
    if (l8Phase === 5) {
        if (l8T > 60 && mouseX > 150 && mouseX < 250 && mouseY > 110 && mouseY < 280) { level = 9; initLevel9(); }
        return;
    }
    if (l8Phase !== 3) { return; }
    if (mouseX > 326 && mouseX < 392 && mouseY > 5 && mouseY < 25) { l8Run(); return; }
    for (var i = 0; i < l8Hits.length; i++) {
        var h = l8Hits[i];
        if (l8IsDraggable(h.id) && mouseX >= h.x && mouseX <= h.x + h.w && mouseY >= h.y && mouseY <= h.y + h.h) {
            l8Drag = {id: h.id, txt: h.txt, x: h.x, y: h.y + 11, ox: mouseX - h.x, oy: mouseY - (h.y + 11), col: h.col};
            return;
        }
    }
};

var level8MouseDragged = function() {
    if (l8Drag.id !== "") {
        l8Drag.x = mouseX - l8Drag.ox;
        l8Drag.y = mouseY - l8Drag.oy;
    }
};

var level8MouseReleased = function() {
    if (l8Drag.id === "") { return; }
    var d = l8Drag.id;
    var target = "";
    for (var i = 0; i < l8Hits.length; i++) {
        var h = l8Hits[i];
        if (h.id !== d && mouseX >= h.x - 2 && mouseX <= h.x + h.w + 2 && mouseY >= h.y && mouseY <= h.y + h.h) { target = h.id; }
    }
    var ok = false;
    if (d === "open" && target === "locked") {
        l8DoorOpen = 1; l8OpenTaken = 1; ok = true;
    } else if (d === "hungry" && target === "true") {
        l8LoopFixed = 1; ok = true;
    } else if (d === "slash" && target === "line7") {
        l8SpeedFixed = 1; ok = true;
    } else if (d.charAt(0) === "L" && target.charAt(0) === "L" && target.length > 1) {
        var a = parseInt(d.substring(1), 10); var b = parseInt(target.substring(1), 10);
        var tmp = l8Name[a]; l8Name[a] = l8Name[b]; l8Name[b] = tmp;
        ok = true;
    }
    if (ok) {
        burst(mouseX, mouseY, 140, 200, 255, 10, 2, 0);
    } else if (target !== "" || d.charAt(0) !== "L") {
        l8Nope = {x: mouseX, y: mouseY, t: 30};
    }
    l8Drag = {id: "", txt: "", x: 0, y: 0, ox: 0, oy: 0, col: [0, 0, 0]};
};


// ============ LEVEL 7 - THE VENDING MACHINE ============
var VM_X = 50;
var VM_Y = 40;
var VM_W = 240;
var VM_H = 320;
var L7_CODE = ["D4", "C3", "B2", "A1"];
var L7_SLOT_X = 250;   // coin slot
var L7_SLOT_Y = 182;
var L7_CUP_X = 250;    // coin return cup
var L7_CUP_Y = 224;
var l7Types = ["chips", "bar", "can", "donut"];
var l7Cols = [[230, 60, 50], [250, 190, 40], [60, 140, 230], [120, 200, 80], [200, 90, 200], [250, 130, 40]];
var l7Snacks = [];
var l7Credit = 0;
var l7Entry = "";
var l7Seq = [];
var l7Msg = "INSERT COIN";
var l7Btn = -1;
var l7BtnT = 0;
var l7Hanger = {x: 376, y: 84, onRack: 1, vy: 0, fishT: 0, fished: 0, fishX: 0};
var l7Coin = {x: 168, y: 366, where: "under", vy: 0};
var l7Junk = [];
var l7Mouse = {x: 0, y: 0, active: 0, t: 0};
var l7Manual = {x: 112, y: 33, where: "top", vy: 0, open: 0, read: 0, vr: 0, r: 0};
var l7Vend = {slot: "", t: 0};
var l7Aval = {on: 0, t: 0, done: 0, binCount: 0, flapOpen: 0};
var l7Falling = [];
var l7Pile = [];
var l7Bag = {x: 154, y: 137, out: 0, vy: 0, vx: 0, landed: 0};
var l7PressX = 0;
var l7PressY = 0;
var l7Says = {txt: "", x: 0, y: 0, t: 0};
var l7Idle = 0;   // frames since the coin went in with nothing pressed

var initLevel7 = function() {
    l7Snacks = [];
    for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
            if (r === 1 && c === 2) { continue; } // that's the stuck bag
            var col = l7Cols[(r * 4 + c) % l7Cols.length];
            l7Snacks.push({r: r, c: c, type: l7Types[(r + c) % 4], cr: col[0], cg: col[1], cb: col[2], left: 3, wig: 0});
        }
    }
    l7Credit = 0; l7Entry = ""; l7Seq = []; l7Msg = "INSERT COIN"; l7Btn = -1; l7BtnT = 0;
    l7Hanger = {x: 376, y: 84, onRack: 1, vy: 0, fishT: 0, fished: 0, fishX: 0};
    l7Coin = {x: 168, y: 366, where: "under", vy: 0};
    l7Junk = []; l7Mouse = {x: 0, y: 0, active: 0, t: 0};
    l7Manual = {x: 112, y: 33, where: "top", vy: 0, open: 0, read: 0, vr: 0, r: 0};
    l7Vend = {slot: "", t: 0};
    l7Aval = {on: 0, t: 0, done: 0, binCount: 0, flapOpen: 0};
    l7Falling = []; l7Pile = [];
    l7Bag = {x: 154, y: 137, out: 0, vy: 0, vx: 0, landed: 0};
    l7Says = {txt: "", x: 0, y: 0, t: 0};
    l7Idle = 0;
};
initLevel7();

var l7SlotX = function(c) { return 80 + c * 37; };
var l7SlotY = function(r) { return 84 + r * 55; };
var l7Say = function(txt, x, y) { l7Says = {txt: txt, x: x, y: y, t: 90}; };

var drawL7Snack = function(type, x, y, cr, cg, cb, sz) {
    pushMatrix();
    translate(x, y);
    scale(sz);
    noStroke();
    if (type === "chips") {
        fill(cr, cg, cb);
        rect(-9, -12, 18, 24, 2);
        for (var z = 0; z < 4; z++) {
            triangle(-9 + z * 4.5, -12, -4.5 + z * 4.5, -12, -6.75 + z * 4.5, -15);
            triangle(-9 + z * 4.5, 12, -4.5 + z * 4.5, 12, -6.75 + z * 4.5, 15);
        }
        fill(255, 255, 255, 200); ellipse(0, 0, 12, 9);
        fill(cr * 0.6, cg * 0.6, cb * 0.6); ellipse(0, 0, 6, 4);
        fill(255, 255, 255, 60); rect(-7, -10, 3, 18);
    } else if (type === "bar") {
        fill(cr, cg, cb);
        rect(-13, -5, 26, 10, 2);
        fill(cr * 0.7, cg * 0.7, cb * 0.7);
        rect(-15, -4, 3, 8); rect(12, -4, 3, 8);
        fill(255); textSize(5); textAlign(CENTER); text("YUM", 0, 2);
    } else if (type === "can") {
        fill(cr, cg, cb);
        rect(-7, -11, 14, 22, 3);
        fill(210, 210, 215); ellipse(0, -11, 14, 4);
        fill(255, 255, 255, 120); rect(-5, -7, 2, 15);
        fill(255); rect(-7, -2, 14, 4);
    } else {
        fill(210, 150, 80); ellipse(0, 0, 20, 15);
        fill(cr, cg, cb); ellipse(0, -1, 17, 11);
        fill(40, 30, 40); ellipse(0, 0, 6, 4);
        fill(255, 255, 255); rect(-5, -4, 2, 1); rect(3, -3, 2, 1); rect(-1, 2, 2, 1);
    }
    popMatrix();
};

var drawL7Hanger = function(x, y) {
    noFill();
    stroke(170, 175, 185); strokeWeight(2);
    arc(x, y + 4, 8, 8, 180, 360);
    line(x + 4, y + 4, x, y + 10);
    line(x, y + 10, x - 18, y + 24);
    line(x, y + 10, x + 18, y + 24);
    line(x - 18, y + 24, x + 18, y + 24);
    noStroke(); strokeWeight(1);
};

var drawL7Room = function() {
    noStroke();
    // tiled break-room wall
    fill(92, 118, 104); rect(0, 0, 400, 372);
    fill(84, 108, 95);
    for (var tx = 0; tx < 400; tx += 25) { rect(tx, 0, 1, 372); }
    for (var ty = 0; ty < 372; ty += 25) { rect(0, ty, 400, 1); }
    // flickery light
    var on = !(frameCount % 170 < 6 || frameCount % 290 < 3);
    fill(60, 60, 60); rect(300, 6, 84, 8);
    if (on) { fill(240, 255, 240); rect(304, 14, 76, 4); fill(240, 255, 240, 25); triangle(300, 18, 384, 18, 342, 120); }
    else { fill(120, 130, 120); rect(304, 14, 76, 4); }
    // poster
    fill(250, 245, 230); rect(306, 150, 64, 78);
    fill(200, 40, 50); rect(310, 154, 56, 12);
    fill(255); textSize(6); textAlign(CENTER); text("EMPLOYEE OF", 338, 160); text("THE MONTH", 338, 165);
    fill(200, 40, 50); rect(326, 172, 24, 40, 2);
    fill(40, 40, 50); rect(329, 176, 14, 26);
    fill(0); ellipse(334, 186, 3, 3); ellipse(339, 186, 3, 3);
    stroke(0); noFill(); arc(336.5, 191, 8, 5, 0, 180); noStroke();
    fill(60); textSize(6); text("VEND-O-MATIC", 338, 222);
    // floor
    fill(110, 100, 92); rect(0, 372, 400, 28);
    fill(100, 90, 84);
    for (var fx = 0; fx < 400; fx += 40) { rect(fx, 372, 20, 14); rect(fx + 20, 386, 20, 14); }
    // coat rack
    fill(90, 60, 35);
    rect(372, 70, 6, 302);
    ellipse(375, 372, 46, 8);
    rect(352, 80, 46, 4);
    // the coat (on the left hook)
    fill(120, 80, 50);
    quad(346, 84, 366, 84, 372, 190, 340, 190);
    fill(100, 66, 40);
    quad(352, 84, 360, 84, 362, 140, 354, 140);
    fill(160, 110, 70); ellipse(356, 84, 18, 8);
    fill(230, 200, 60); ellipse(362, 110, 3, 3); ellipse(362, 124, 3, 3);
};

var drawL7Machine = function() {
    var shk = (l7Aval.on && !l7Aval.done) ? random(-2, 2) : 0;
    pushMatrix();
    translate(shk, 0);
    noStroke();
    // shadow + legs + the dark gap underneath
    fill(0, 0, 0, 60); rect(VM_X - 4, 372, VM_W + 8, 4);
    fill(20, 20, 24); rect(VM_X, 358, VM_W, 14);
    fill(60, 60, 66); rect(VM_X + 6, 358, 12, 14); rect(VM_X + VM_W - 18, 358, 12, 14);
    // body
    fill(185, 32, 44); rect(VM_X, VM_Y, VM_W, VM_H - 22, 6);
    fill(160, 25, 38); rect(VM_X + VM_W - 10, VM_Y, 10, VM_H - 22, 0, 6, 6, 0);
    fill(210, 60, 70); rect(VM_X + 4, VM_Y + 2, VM_W - 16, 4, 3);
    // sign
    fill(255, 240, 200); textSize(12); textAlign(CENTER);
    text("SNAX", 138, VM_Y + 15);
    // glass case
    fill(28, 30, 40); rect(62, 60, 150, 236, 3);
    for (var r = 0; r < 4; r++) {
        fill(80, 85, 95); rect(64, l7SlotY(r) + 22, 146, 3);
        stroke(170, 170, 180); strokeWeight(1); noFill();
        for (var c = 0; c < 4; c++) {
            var cx = l7SlotX(c); var cy = l7SlotY(r) + 18;
            var spin = (l7Vend.slot === "ABCD".charAt(r) + (c + 1) && l7Vend.t < 60) || (l7Aval.on && l7Aval.t > 40 && l7Aval.t < 220);
            var ph = spin ? frameCount * 20 : 0;
            for (var k = 0; k < 4; k++) {
                var kx = cx - 12 + k * 7;
                line(kx, cy + 2 + sin(ph + k * 90) * 1, kx + 3.5, cy - 2);
                line(kx + 3.5, cy - 2, kx + 7, cy + 2 + sin(ph + k * 90 + 45) * 1);
            }
        }
        noStroke();
        fill(200, 200, 160); textSize(6); textAlign(CENTER);
        for (var c2 = 0; c2 < 4; c2++) { text("ABCD".charAt(r) + (c2 + 1), l7SlotX(c2), l7SlotY(r) + 31); }
    }
    for (var i = 0; i < l7Snacks.length; i++) {
        var sn = l7Snacks[i];
        if (sn.left <= 0) { continue; }
        var wig = sn.wig > 0 ? sin(sn.wig * 40) * 3 : 0;
        if (sn.wig > 0) { sn.wig--; }
        drawL7Snack(sn.type, l7SlotX(sn.c) + wig, l7SlotY(sn.r), sn.cr, sn.cg, sn.cb, 1);
    }
    // the stuck bag, hanging off its coil
    if (!l7Bag.out) {
        var bw = (l7Vend.slot === "B3" && l7Vend.t > 20 && l7Vend.t < 70) ? sin(frameCount * 30) * 6 : 0;
        pushMatrix();
        translate(l7SlotX(2), l7SlotY(1) + 10);
        rotate(24 + bw);
        drawL7Snack("chips", 0, 8, 140, 60, 220, 1.15);
        fill(255, 230, 90); textSize(5); textAlign(CENTER); text("LVL 8", 0, 12);
        popMatrix();
    }
    // falling snacks inside the glass
    for (var f = l7Falling.length - 1; f >= 0; f--) {
        var fs = l7Falling[f];
        fs.vy += 0.5; fs.y += fs.vy; fs.rot += fs.vr;
        pushMatrix(); translate(fs.x, fs.y); rotate(fs.rot);
        drawL7Snack(fs.type, 0, 0, fs.cr, fs.cg, fs.cb, 0.9);
        popMatrix();
        if (fs.y > 302) {
            l7Aval.binCount++;
            l7Falling.splice(f, 1);
            if (l7Aval.flapOpen) {
                l7Pile.push({type: fs.type, cr: fs.cr, cg: fs.cg, cb: fs.cb, x: random(70, 230), y: random(376, 392), rot: random(-60, 60)});
            }
        }
    }
    // glass glare
    fill(255, 255, 255, 18);
    quad(70, 60, 110, 60, 64, 160, 64, 110);
    quad(150, 60, 170, 60, 100, 296, 80, 296);
    // pickup bin
    fill(20, 20, 26); rect(62, 304, 150, 40, 3);
    if (!l7Aval.flapOpen) {
        fill(60, 62, 70); rect(66, 306, 142, 34, 2);
        fill(200); textSize(8); textAlign(CENTER); text("PUSH", 137, 327);
        if (l7Aval.binCount > 0) {
            fill(255, 255, 255, 30);
            rect(66, 340 - min(32, l7Aval.binCount * 1.2), 142, min(32, l7Aval.binCount * 1.2));
        }
    } else {
        fill(60, 62, 70); quad(66, 344, 208, 344, 216, 356, 58, 356);
    }
    // control panel
    fill(45, 45, 52); rect(222, 60, 60, 236, 3);
    fill(20, 40, 25); rect(226, 66, 52, 22, 2);
    fill(110, 255, 140); textSize(7); textAlign(CENTER);
    var shown = l7Msg;
    if (l7Entry !== "") { shown = l7Entry + "_"; }
    text(shown, 252, 80);
    var keys = ["A", "B", "C", "D", "1", "2", "3", "4"];
    for (var b = 0; b < 8; b++) {
        var bx = b < 4 ? 228 : 254; var by = 96 + (b % 4) * 18;
        var lit = (l7Btn === b && l7BtnT > 0);
        fill(lit ? 255 : 200, lit ? 240 : 200, lit ? 120 : 205);
        rect(bx, by, 22, 14, 3);
        fill(30); textSize(9); text(keys[b], bx + 11, by + 11);
    }
    if (l7BtnT > 0) { l7BtnT--; }
    // coin slot
    fill(25); rect(L7_SLOT_X - 2, L7_SLOT_Y - 9, 4, 18, 1);
    fill(160); textSize(6); text("25c", L7_SLOT_X + 14, L7_SLOT_Y + 2);
    // coin return cup
    fill(25); rect(L7_CUP_X - 12, L7_CUP_Y - 8, 24, 16, 3);
    fill(160); textSize(6); text("RETURN", L7_CUP_X, L7_CUP_Y + 16);
    popMatrix();
    // the manual sitting on top (just a corner poking over the edge)
    if (l7Manual.where === "top") {
        fill(40, 70, 140); rect(96, 31, 34, 9, 1);
        fill(240, 235, 220); rect(98, 33, 30, 3);
    }
    // coin glinting under the machine
    if (l7Coin.where === "under") {
        fill(255, 220, 90, 120 + 100 * sin(frameCount * 5)); ellipse(l7Coin.x, l7Coin.y, 8, 3);
    }
};

var drawL7Coin = function(x, y) {
    noStroke();
    fill(200, 160, 40); ellipse(x, y, 13, 13);
    fill(240, 205, 80); ellipse(x, y, 10, 10);
    fill(200, 160, 40); textSize(6); textAlign(CENTER); text("25", x, y + 2);
};

var drawL7Manual = function() {
    if (l7Manual.where === "top") { return; }
    pushMatrix();
    translate(l7Manual.x, l7Manual.y);
    rotate(l7Manual.r);
    fill(0, 0, 0, 50); rect(-15, -8, 34, 20);
    fill(40, 70, 140); rect(-17, -11, 34, 22, 2);
    fill(240, 235, 220); rect(-15, 8, 30, 3);
    fill(255); textSize(5); textAlign(CENTER); text("VEND-O-MATIC", 0, -3); text("MANUAL", 0, 3);
    popMatrix();
};

var drawL7ManualPage = function() {
    fill(0, 0, 0, 150); rect(0, 0, 400, 400);
    fill(250, 246, 232); rect(60, 50, 280, 300, 4);
    fill(40, 70, 140); rect(60, 50, 280, 30, 4, 4, 0, 0);
    fill(255); textSize(12); textAlign(CENTER); text("VEND-O-MATIC 3000 MANUAL", 200, 70);
    fill(40); textSize(9); textAlign(LEFT);
    var lines = ["1. Do not hug the machine.",
                 "2. Do not tell the machine your secrets.",
                 "3. If snack is stuck, this is normal.",
                 "   The machine is just shy.",
                 "4. Do not shake the machine. It is ticklish.",
                 "",
                 "TECHNICIAN TEST MODE (dispenses ALL):",
                 "   insert coin, then press",
                 "",
                 "",
                 "5. Run."];
    for (var i = 0; i < lines.length; i++) { text(lines[i], 76, 104 + i * 18); }
    fill(180, 30, 40); textSize(16); textAlign(CENTER);
    text("D4  C3  B2  A1", 200, 268);
    fill(120); textSize(8); text("(click to close)", 200, 336);
};

var drawLevel7 = function() {
    drawL7Room();
    drawL7Machine();
    // the pile of snacks after the avalanche
    for (var p = 0; p < l7Pile.length; p++) {
        var pl = l7Pile[p];
        pushMatrix(); translate(pl.x, pl.y); rotate(pl.rot);
        drawL7Snack(pl.type, 0, 0, pl.cr, pl.cg, pl.cb, 0.9);
        popMatrix();
    }
    // junk fished out from under the machine
    for (var j = 0; j < l7Junk.length; j++) {
        var jk = l7Junk[j];
        jk.x += jk.vx; jk.vx *= 0.9;
        noStroke();
        if (jk.type === "dust") { fill(150, 150, 150); ellipse(jk.x, jk.y, 14, 8); ellipse(jk.x + 5, jk.y - 2, 9, 7); fill(120); ellipse(jk.x - 3, jk.y - 1, 2, 2); ellipse(jk.x + 1, jk.y - 1, 2, 2); }
        else if (jk.type === "gum") { fill(255, 130, 180); ellipse(jk.x, jk.y, 10, 6); fill(255, 180, 210); ellipse(jk.x - 2, jk.y - 1, 4, 2); }
        else if (jk.type === "sock") { fill(240); rect(jk.x - 4, jk.y - 10, 8, 12, 2); rect(jk.x - 4, jk.y - 2, 14, 6, 2); fill(220, 60, 60); rect(jk.x - 4, jk.y - 10, 8, 3); }
        else if (jk.type === "button") { fill(90, 160, 220); ellipse(jk.x, jk.y, 9, 9); fill(40); ellipse(jk.x - 1.5, jk.y, 2, 2); ellipse(jk.x + 1.5, jk.y, 2, 2); }
    }
    // the mouse that lived under there
    if (l7Mouse.active) {
        l7Mouse.t++;
        l7Mouse.x += 3.2;
        var hop = abs(sin(l7Mouse.t * 25)) * 3;
        fill(140, 140, 150); ellipse(l7Mouse.x, l7Mouse.y - hop, 16, 9);
        ellipse(l7Mouse.x + 7, l7Mouse.y - 3 - hop, 8, 7);
        fill(240, 170, 180); ellipse(l7Mouse.x + 5, l7Mouse.y - 7 - hop, 5, 5); ellipse(l7Mouse.x + 11, l7Mouse.y - 1 - hop, 2, 2);
        stroke(240, 170, 180); line(l7Mouse.x - 8, l7Mouse.y - hop, l7Mouse.x - 16, l7Mouse.y - 4 - hop); noStroke();
        fill(0); ellipse(l7Mouse.x + 8, l7Mouse.y - 4 - hop, 2, 2);
        if (l7Mouse.x > 440) { l7Mouse.active = 0; }
    }
    drawL7Manual();
    // coin
    if (l7Coin.where === "floor" || l7Coin.where === "cup" || l7Coin.where === "held") { drawL7Coin(l7Coin.x, l7Coin.y); }
    // the LEVEL 8 bag, finally free
    if (l7Bag.out) {
        if (!l7Bag.landed) {
            l7Bag.vy += 0.5; l7Bag.y += l7Bag.vy; l7Bag.x += l7Bag.vx;
            if (l7Bag.y > 300 && l7Bag.vx === 0) { l7Bag.vx = -0.6; l7Bag.vy = -7; l7Bag.y = 300; }
            if (l7Bag.vx !== 0 && l7Bag.y > 356 && l7Bag.vy > 0) { l7Bag.y = 356; l7Bag.landed = 1; shake(3); burst(l7Bag.x, 370, 255, 230, 90, 20, 3, 0.05); }
        }
        if (l7Bag.landed) {
            fill(255, 230, 90, 40 + 30 * sin(frameCount * 5)); ellipse(l7Bag.x, l7Bag.y, 60, 60);
        }
        pushMatrix(); translate(l7Bag.x, l7Bag.y); rotate(l7Bag.landed ? -6 : frameCount * 12);
        drawL7Snack("chips", 0, 0, 140, 60, 220, 1.6);
        fill(255, 230, 90); textSize(6); textAlign(CENTER); text("LEVEL 8", 0, 5); text("FLAVOR", 0, 11);
        popMatrix();
    }
    // the hanger
    if (l7Hanger.fishT > 0) {
        l7Hanger.fishT--;
        var ft = 60 - l7Hanger.fishT;
        l7Hanger.x = l7Hanger.fishX + (ft > 15 && ft < 45 ? sin(ft * 24) * 22 : 0);
        l7Hanger.y = ft < 15 ? 332 + ft * 2 : (ft < 45 ? 362 : 362 - (ft - 45) * 1.2);
        if (frameCount % 4 === 0) { burst(l7Hanger.x, 368, 150, 150, 150, 2, 1.2, 0.05); }
        if (l7Hanger.fishT === 0) {
            l7Hanger.y = 344;
            if (!l7Hanger.fished) {
                l7Hanger.fished = 1;
                l7Junk.push({type: "dust", x: l7Hanger.x - 30, y: 386, vx: -3});
                l7Junk.push({type: "gum", x: l7Hanger.x - 10, y: 388, vx: -1.5});
                l7Junk.push({type: "sock", x: l7Hanger.x + 14, y: 390, vx: 2});
                l7Junk.push({type: "button", x: l7Hanger.x + 34, y: 385, vx: 3});
                l7Coin.where = "floor"; l7Coin.x = l7Hanger.x + 2; l7Coin.y = 384;
                l7Mouse.active = 1; l7Mouse.x = l7Hanger.x; l7Mouse.y = 388; l7Mouse.t = 0;
                l7Say("squeak!", l7Hanger.x + 20, 360);
                burst(l7Hanger.x, 380, 160, 160, 160, 20, 2.5, 0.05);
            } else {
                l7Say("...just dust", l7Hanger.x, 336);
                burst(l7Hanger.x, 380, 160, 160, 160, 10, 2, 0.05);
            }
        }
    } else if (draggingBtn !== l7Hanger && !l7Hanger.onRack && l7Hanger.y < 344) {
        l7Hanger.vy += 0.5; l7Hanger.y = min(344, l7Hanger.y + l7Hanger.vy);
        if (l7Hanger.y >= 344) { l7Hanger.vy = 0; }
    }
    drawL7Hanger(l7Hanger.x, l7Hanger.y);
    // manual falling off the top
    if (l7Manual.where === "falling") {
        l7Manual.vy += 0.5; l7Manual.y += l7Manual.vy; l7Manual.r += l7Manual.vr;
        if (l7Manual.y >= 384) {
            l7Manual.y = 384; l7Manual.where = "floor"; l7Manual.r = -8;
            shake(2); burst(l7Manual.x, 388, 170, 170, 170, 14, 2, 0.05);
        }
    }
    // coin falling if dropped in the air
    if (l7Coin.where === "floor" && l7Coin.y < 384 && draggingBtn !== l7Coin) {
        l7Coin.vy += 0.5; l7Coin.y = min(384, l7Coin.y + l7Coin.vy);
        if (l7Coin.y >= 384) { l7Coin.vy = 0; }
    }
    // speech
    if (l7Says.t > 0) {
        l7Says.t--;
        fill(255, 255, 255, min(255, l7Says.t * 8)); textSize(10); textAlign(CENTER);
        text(l7Says.txt, l7Says.x, l7Says.y - (90 - l7Says.t) * 0.2);
    }
    // ---- coin in but nothing picked: it tries your snack by itself ----
    if (l7Credit > 0 && l7Vend.slot === "" && !l7Aval.on) {
        l7Idle++;
        if (l7Entry === "" && l7Seq.length === 0 && l7Msg === "PICK A SNACK" && l7Idle % 40 === 20) { l7Msg = " "; }
        else if (l7Entry === "" && l7Seq.length === 0 && l7Msg === " " && l7Idle % 40 === 0) { l7Msg = "PICK A SNACK"; }
        if (l7Idle > 240 && l7Entry === "" && l7Seq.length === 0) {
            l7Vend = {slot: "B3", t: 0};
            l7Idle = 0;
        }
    }
    // ---- a normal purchase (it never works) ----
    if (l7Vend.slot !== "") {
        l7Vend.t++;
        if (l7Vend.t === 1) { l7Msg = "VENDING..."; }
        if (l7Vend.t === 60) {
            for (var s2 = 0; s2 < l7Snacks.length; s2++) {
                var ss = l7Snacks[s2];
                if ("ABCD".charAt(ss.r) + (ss.c + 1) === l7Vend.slot) { ss.wig = 30; }
            }
            l7Msg = "ENJOY! :)";
        }
        if (l7Vend.t === 110) { l7Msg = "STUCK"; }
        if (l7Vend.t === 150) { l7Msg = "RETURNING COIN"; }
        if (l7Vend.t === 190) {
            // the machine spits your coin back out
            l7Coin.where = "cup"; l7Coin.x = L7_CUP_X; l7Coin.y = L7_CUP_Y;
            burst(L7_CUP_X, L7_CUP_Y, 255, 220, 90, 10, 2, 0.1);
            l7Say("*ptooey*", L7_CUP_X, L7_CUP_Y - 14);
            l7Credit = 0; l7Msg = "INSERT COIN";
            l7Vend = {slot: "", t: 0};
        }
    }
    // ---- test mode: everything comes out ----
    if (l7Aval.on && !l7Aval.done) {
        l7Aval.t++;
        if (l7Aval.t < 40) { l7Msg = l7Aval.t % 10 < 5 ? "TEST MODE" : "!!!!!!!!"; }
        if (l7Aval.t === 40) { shake(5); }
        if (l7Aval.t > 40 && l7Aval.t < 220 && l7Aval.t % 4 === 0) {
            var cand = [];
            for (var q = 0; q < l7Snacks.length; q++) { if (l7Snacks[q].left > 0) { cand.push(q); } }
            if (cand.length > 0) {
                var pick = l7Snacks[cand[floor(random(0, cand.length))]];
                pick.left--;
                l7Falling.push({type: pick.type, cr: pick.cr, cg: pick.cg, cb: pick.cb, x: l7SlotX(pick.c), y: l7SlotY(pick.r), vy: 0, rot: 0, vr: random(-10, 10)});
            }
            l7Msg = "DISPENSING ALL";
        }
        if (l7Aval.binCount > 22 && !l7Aval.flapOpen) {
            l7Aval.flapOpen = 1; shake(8);
            for (var pp = 0; pp < 14; pp++) {
                var src = l7Snacks[pp % l7Snacks.length];
                l7Pile.push({type: src.type, cr: src.cr, cg: src.cg, cb: src.cb, x: random(70, 230), y: random(376, 394), rot: random(-60, 60)});
            }
            burst(137, 350, 255, 200, 120, 30, 4, 0.1);
        }
        if (l7Aval.t === 240) {
            l7Bag.out = 1; l7Bag.x = l7SlotX(2); l7Bag.y = l7SlotY(1) + 14; l7Bag.vy = 0; l7Bag.vx = 0;
            l7Msg = "...FINALLY";
        }
        if (l7Bag.landed) { l7Aval.done = 1; l7Msg = "OUT OF EVERYTHING"; }
    }
    if (l7Manual.open) { drawL7ManualPage(); }
};

var level7MousePressed = function() {
    l7PressX = mouseX; l7PressY = mouseY;
    if (l7Manual.open) { l7Manual.open = 0; return; }
    if (l7Aval.done && dist(mouseX, mouseY, l7Bag.x, l7Bag.y) < 26) {
        level = 8;
        initLevel8();
        return;
    }
    // coin
    if ((l7Coin.where === "floor" || l7Coin.where === "cup") && dist(mouseX, mouseY, l7Coin.x, l7Coin.y) < 11) {
        l7Coin.where = "held";
        draggingBtn = l7Coin; dragOffsetX = mouseX - l7Coin.x; dragOffsetY = mouseY - l7Coin.y;
        return;
    }
    // hanger
    if (l7Hanger.fishT === 0 && abs(mouseX - l7Hanger.x) < 20 && mouseY > l7Hanger.y - 4 && mouseY < l7Hanger.y + 28) {
        l7Hanger.onRack = 0;
        draggingBtn = l7Hanger; dragOffsetX = mouseX - l7Hanger.x; dragOffsetY = mouseY - l7Hanger.y;
        return;
    }
    // manual on the floor
    if (l7Manual.where === "floor" && abs(mouseX - l7Manual.x) < 18 && abs(mouseY - l7Manual.y) < 12) {
        l7Manual.open = 1; l7Manual.read = 1;
        return;
    }
    // keypad
    var keys = ["A", "B", "C", "D", "1", "2", "3", "4"];
    for (var b = 0; b < 8; b++) {
        var bx = b < 4 ? 228 : 254; var by = 96 + (b % 4) * 18;
        if (mouseX >= bx && mouseX <= bx + 22 && mouseY >= by && mouseY <= by + 14) {
            l7Btn = b; l7BtnT = 8; l7Idle = 0;
            if (l7Aval.on || l7Vend.slot !== "") { return; }
            if (l7Credit === 0) { l7Msg = "INSERT COIN"; l7Entry = ""; return; }
            var k = keys[b];
            if (b < 4) { l7Entry = k; return; }
            if (l7Entry === "") { l7Msg = "LETTER FIRST"; return; }
            var pair = l7Entry + k;
            l7Entry = "";
            l7Seq.push(pair);
            var prefix = true;
            for (var i = 0; i < l7Seq.length; i++) { if (l7Seq[i] !== L7_CODE[i]) { prefix = false; } }
            if (prefix && l7Seq.length === L7_CODE.length) {
                l7Aval.on = 1; l7Aval.t = 0; l7Credit = 0; l7Seq = [];
                flash(255, 255, 200, 60);
            } else if (prefix) {
                l7Msg = l7Seq.join(" ") + " ...";
            } else {
                l7Seq = [];
                l7Vend = {slot: pair, t: 0};
            }
            return;
        }
    }
};

var level7MouseDragged = function() {
    if (draggingBtn !== -1 && draggingBtn.x !== undefined) {
        draggingBtn.x = mouseX - dragOffsetX;
        draggingBtn.y = mouseY - dragOffsetY;
    }
};

var level7MouseReleased = function() {
    if (draggingBtn === l7Coin) {
        if (dist(l7Coin.x, l7Coin.y, L7_SLOT_X, L7_SLOT_Y) < 18 && l7Credit === 0 && l7Vend.slot === "" && !l7Aval.on) {
            l7Coin.where = "slot";
            l7Credit = 1; l7Msg = "PICK A SNACK"; l7Idle = 0;
            burst(L7_SLOT_X, L7_SLOT_Y, 255, 220, 90, 8, 1.5, 0);
        } else {
            l7Coin.where = "floor";
            if (l7Coin.y > 384) { l7Coin.y = 384; }
        }
    }
    if (draggingBtn === l7Hanger) {
        if (dist(l7Hanger.x, l7Hanger.y, 376, 84) < 18) {
            l7Hanger.onRack = 1; l7Hanger.x = 376; l7Hanger.y = 84;
        } else if (l7Hanger.y + 24 > 340 && l7Hanger.x > 52 && l7Hanger.x < 288) {
            // poke it under the machine
            l7Hanger.fishT = 60; l7Hanger.fishX = l7Hanger.x;
        } else if (l7Hanger.y < 52 && l7Hanger.x > 60 && l7Hanger.x < 280 && l7Manual.where === "top") {
            // knock whatever's up there off the top
            l7Manual.where = "falling"; l7Manual.vy = -3; l7Manual.vr = 9;
            l7Say("thunk", 112, 26);
        }
    }
    draggingBtn = -1;
};


// ============ LEVEL 6 - THE DEVELOPER'S DESK ============
var L6_SX = 50;   // the monitor's screen on the desk (the desktop you shatter lives here)
var L6_SY = 25;
var L6_SS = 120;
var l6Phase = 0;  // 0 desktop, 1 shattering, 2 zooming out, 3 desk
var l6T = 0;
var l6Cracks = [];
var l6Shards = [];
var l6Lamp = 0;
var l6Mug = {x: 215, y: 212, px: 215, lastVX: 0, energy: 0, spilled: 0, tilt: 0};
var l6Key = {x: 0, y: 0, visible: 0};
var l6Drawer = {open: 0, slide: 0};
var l6Usb = {x: 0, y: 0, visible: 0, inPort: 0};
var l6Laptop = {boot: 0, ready: 0};
var l6Puddle = 0;
var l6Squeak = 0;
var l6Notes = [];

var initLevel6 = function() {
    l6Phase = 0; l6T = 0;
    l6Cracks = []; l6Shards = [];
    l6Lamp = 0;
    l6Mug = {x: 215, y: 212, px: 215, lastVX: 0, energy: 0, spilled: 0, tilt: 0};
    l6Key = {x: 0, y: 0, visible: 0};
    l6Drawer = {open: 0, slide: 0};
    l6Usb = {x: 0, y: 0, visible: 0, inPort: 0};
    l6Laptop = {boot: 0, ready: 0};
    l6Puddle = 0; l6Squeak = 0; l6Notes = [];
};

var l6Wall = function(x, y) {
    // desktop wallpaper colour at a point (used for the shards too)
    var k = y / 400;
    return [60 + 40 * k, 30 + 20 * k, 110 - 30 * k];
};

var drawL6Desktop = function() {
    noStroke();
    for (var gy = 0; gy < 370; gy += 10) {
        var c = l6Wall(0, gy);
        fill(c[0], c[1], c[2]);
        rect(0, gy, 400, 10);
    }
    // wallpaper: moon over the level 1 hills
    fill(245, 245, 230, 40); ellipse(300, 90, 110, 110);
    fill(245, 245, 230); ellipse(300, 90, 60, 60);
    fill(40, 20, 70);
    ellipse(90, 380, 360, 200);
    ellipse(330, 390, 320, 170);
    // icons
    var icons = ["monster_game.js", "Recycle Bin", "lvl7_FINAL_v2.js", "homework.doc"];
    for (var i = 0; i < icons.length; i++) {
        var ix = 34; var iy = 30 + i * 70;
        fill(255, 255, 255, 30);
        rect(ix - 22, iy - 6, 44, 58, 4);
        if (i === 1) {
            fill(190, 200, 215); rect(ix - 11, iy + 4, 22, 26, 2);
            fill(150, 160, 175); rect(ix - 13, iy, 26, 5);
        } else {
            fill(245, 245, 250); rect(ix - 11, iy, 22, 30, 2);
            fill(i === 0 ? 150 : 90, i === 0 ? 20 : 140, i === 0 ? 200 : 220);
            rect(ix - 11, iy + 20, 22, 10);
        }
        fill(255);
        textSize(7); textAlign(CENTER);
        text(icons[i], ix, iy + 44);
    }
    // error window
    fill(0, 0, 0, 70); rect(118, 148, 220, 100, 4);
    fill(235, 235, 240); rect(114, 144, 220, 100, 4);
    fill(60, 90, 200); rect(114, 144, 220, 18, 4, 4, 0, 0);
    fill(255); textSize(8); textAlign(LEFT);
    text("monster_game.js", 120, 156);
    fill(220, 60, 60); rect(318, 147, 12, 12, 2);
    fill(255); textAlign(CENTER); text("x", 324, 156);
    fill(220, 60, 60); ellipse(140, 190, 20, 20);
    fill(255); textSize(14); text("!", 140, 195);
    fill(30); textSize(10); textAlign(LEFT);
    text("Level 6 not found.", 158, 188);
    textSize(8);
    text("The developer hasn't made it yet.", 158, 202);
    fill(200, 200, 208); rect(268, 218, 52, 18, 3);
    fill(30); textAlign(CENTER); text("OK", 294, 230);
    // taskbar
    fill(25, 25, 35); rect(0, 370, 400, 30);
    fill(60, 160, 90); rect(4, 374, 50, 22, 3);
    fill(255); textSize(10); text("Start", 29, 389);
    fill(60, 60, 80); rect(62, 374, 90, 22, 3);
    fill(220); textSize(8); text("monster_game.js", 107, 388);
    fill(230); textSize(9); text("11:59 PM", 368, 389);
};

var drawL6Cracks = function(a) {
    for (var i = 0; i < l6Cracks.length; i++) {
        var c = l6Cracks[i];
        stroke(255, 255, 255, 60 * a); strokeWeight(3);
        for (var j = 0; j < c.length; j++) { line(c[j][0], c[j][1], c[j][2], c[j][3]); }
        stroke(255, 255, 255, 220 * a); strokeWeight(1);
        for (var j2 = 0; j2 < c.length; j2++) { line(c[j2][0], c[j2][1], c[j2][2], c[j2][3]); }
        noStroke();
        fill(255, 255, 255, 120 * a);
        ellipse(c[0][0], c[0][1], 6, 6);
    }
    strokeWeight(1);
};

var addL6Crack = function(x, y) {
    var segs = [];
    var arms = floor(random(6, 10));
    for (var a = 0; a < arms; a++) {
        var ang = a * (360 / arms) + random(-15, 15);
        var px = x; var py = y;
        var len = random(40, 110);
        var steps = 4;
        for (var s = 0; s < steps; s++) {
            ang += random(-18, 18);
            var nx = px + cos(ang) * len / steps;
            var ny = py + sin(ang) * len / steps;
            segs.push([px, py, nx, ny]);
            if (random(1) < 0.35) {
                var ba = ang + random(30, 60) * (random(1) < 0.5 ? -1 : 1);
                segs.push([nx, ny, nx + cos(ba) * len * 0.2, ny + sin(ba) * len * 0.2]);
            }
            px = nx; py = ny;
        }
    }
    // a ring around the impact
    var ringR = random(10, 18);
    for (var r = 0; r < 8; r++) {
        var r1 = r * 45; var r2 = r1 + 45;
        segs.push([x + cos(r1) * ringR, y + sin(r1) * ringR, x + cos(r2) * ringR, y + sin(r2) * ringR]);
    }
    l6Cracks.push(segs);
};

var makeL6Shards = function() {
    l6Shards = [];
    var n = 6; var cs = 400 / n;
    for (var gx = 0; gx < n; gx++) {
        for (var gy = 0; gy < n; gy++) {
            var x0 = gx * cs + random(-8, 8); var y0 = gy * cs + random(-8, 8);
            var pts = [[x0, y0], [x0 + cs, y0 + random(-10, 10)], [x0 + random(-10, 10), y0 + cs], [x0 + cs + random(-8, 8), y0 + cs]];
            var tris = [[pts[0], pts[1], pts[2]], [pts[1], pts[3], pts[2]]];
            for (var t = 0; t < 2; t++) {
                var T = tris[t];
                var cx = (T[0][0] + T[1][0] + T[2][0]) / 3;
                var cy = (T[0][1] + T[1][1] + T[2][1]) / 3;
                var col = l6Wall(cx, cy);
                l6Shards.push({
                    cx: cx, cy: cy,
                    p: [[T[0][0] - cx, T[0][1] - cy], [T[1][0] - cx, T[1][1] - cy], [T[2][0] - cx, T[2][1] - cy]],
                    vx: (cx - 200) * 0.02 + random(-1, 1), vy: random(-3, 0) - (200 - cy) * 0.01,
                    rot: 0, vr: random(-6, 6), r: col[0], g: col[1], b: col[2],
                    delay: floor(dist(cx, cy, l6Cracks.length ? l6Cracks[l6Cracks.length - 1][0][0] : 200, l6Cracks.length ? l6Cracks[l6Cracks.length - 1][0][1] : 200) / 25)
                });
            }
        }
    }
};

var drawL6Shards = function() {
    for (var i = 0; i < l6Shards.length; i++) {
        var s = l6Shards[i];
        if (s.delay > 0) { s.delay--; }
        else {
            s.cx += s.vx; s.cy += s.vy; s.vy += 0.45; s.rot += s.vr;
        }
        if (s.cy > 480) { continue; }
        pushMatrix();
        translate(s.cx, s.cy);
        rotate(s.rot);
        fill(s.r, s.g, s.b);
        stroke(220, 240, 255, 180); strokeWeight(1);
        triangle(s.p[0][0], s.p[0][1], s.p[1][0], s.p[1][1], s.p[2][0], s.p[2][1]);
        noStroke();
        fill(255, 255, 255, 40);
        triangle(s.p[0][0], s.p[0][1], s.p[1][0] * 0.5, s.p[1][1] * 0.5, s.p[2][0] * 0.5, s.p[2][1] * 0.5);
        popMatrix();
    }
};

var drawL6Desk = function() {
    noStroke();
    // wall
    fill(38, 40, 58); rect(0, 0, 400, 165);
    fill(44, 46, 66);
    for (var wp = 0; wp < 400; wp += 40) { rect(wp, 0, 2, 165); }
    // poster
    fill(20, 20, 30); rect(292, 14, 70, 60);
    fill(90, 40, 140); rect(296, 18, 62, 52);
    // moon
    fill(245, 245, 230, 60); ellipse(347, 29, 16, 16);
    fill(245, 245, 230); ellipse(347, 29, 10, 10);
    // branch
    stroke(70, 45, 20); strokeWeight(2);
    line(297, 25, 357, 22);
    line(340, 23, 346, 18);
    noStroke();
    fill(40, 110, 40); ellipse(303, 24, 8, 5); ellipse(352, 21, 7, 4);
    // the werewolf, hanging on by its claws
    stroke(110, 75, 30); strokeWeight(2.5);
    line(318, 25, 319, 36);           // left arm
    line(330, 24, 328, 36);           // right arm
    line(321, 50, 319, 58);           // legs dangling
    line(326, 50, 328, 58);
    strokeWeight(2);
    line(318, 47, 312, 52);           // tail
    line(312, 52, 310, 49);
    noStroke();
    fill(110, 75, 30);
    ellipse(323.5, 44, 11, 15);       // body
    fill(135, 95, 45);
    ellipse(323.5, 46, 6, 9);         // belly fur
    fill(110, 75, 30);
    ellipse(323.5, 33, 11, 10);       // head
    triangle(319, 30, 320, 23, 323, 29);   // ears
    triangle(324, 29, 327, 23, 328, 30);
    triangle(327, 32, 334, 35, 327, 37);   // snout
    fill(20); ellipse(334, 35, 2, 2);      // nose
    fill(255, 60, 30);
    ellipse(322, 32, 2, 2);                // glowing eyes
    ellipse(325.5, 32, 2, 2);
    fill(240); triangle(329, 36, 330, 38.5, 331, 36); // fang
    fill(255); textSize(6); textAlign(CENTER); text("HANG IN THERE", 327, 66);
    // sticky notes on the wall
    var notes = [[190, 22, "TODO: fix bar\nstuck @ 99%", -4], [232, 58, "safe code\n= 109", 5], [190, 96, "dont let wolf\nnear fire!!", -2]];
    for (var n = 0; n < notes.length; n++) {
        var N = notes[n];
        pushMatrix(); translate(N[0], N[1]); rotate(N[3]);
        fill(0, 0, 0, 40); rect(2, 2, 44, 36);
        fill(255, 235, 110); rect(0, 0, 44, 36);
        fill(240, 215, 80); rect(0, 0, 44, 6);
        fill(60, 50, 20); textSize(6); textAlign(LEFT);
        text(N[2], 4, 16);
        popMatrix();
    }
    // desk
    fill(120, 80, 45); rect(0, 165, 400, 170);
    fill(135, 92, 52);
    for (var pl = 180; pl < 335; pl += 36) { rect(0, pl, 400, 2); }
    fill(100, 66, 36); rect(0, 165, 400, 5);
    // desk front + drawer
    fill(92, 60, 32); rect(0, 335, 400, 65);
    fill(80, 52, 28); rect(0, 335, 400, 4);
    // drawer (slides toward you when open)
    var dsl = l6Drawer.slide;
    if (dsl > 0) {
        fill(50, 32, 18); rect(146, 344, 108, 44 + dsl * 0.2);
        fill(70, 46, 26); rect(150, 344 + dsl * 0.4, 100, 30);
        // usb inside (until you take it)
        if (l6Usb.visible && !l6Usb.inPort && draggingBtn !== l6Usb && l6Usb.x === 0) {
            fill(40, 40, 50); rect(189, 352 + dsl * 0.4, 22, 12, 2);
            fill(190, 190, 200); rect(183, 355 + dsl * 0.4, 6, 6);
            fill(255); textSize(6); textAlign(CENTER); text("LVL 7", 200, 361 + dsl * 0.4);
        }
    }
    fill(110, 72, 40); rect(146, 344 + dsl, 108, 42, 3);
    fill(125, 84, 48); rect(150, 348 + dsl, 100, 5, 2);
    fill(200, 170, 80); rect(190, 360 + dsl, 20, 5, 2);
    // keyhole
    fill(30, 20, 10); ellipse(200, 374 + dsl, 7, 7); rect(199, 375 + dsl, 2, 6);
    // monitor
    fill(25, 25, 30); rect(L6_SX - 8, L6_SY - 8, L6_SS + 16, L6_SS + 16, 4);
    fill(5, 5, 8); rect(L6_SX, L6_SY, L6_SS, L6_SS);
    // the shattered screen
    stroke(180, 200, 230, 120); strokeWeight(1);
    var scx = L6_SX + 70; var scy = L6_SY + 60;
    for (var sc = 0; sc < 11; sc++) {
        var sa = sc * 33;
        line(scx, scy, constrain(scx + cos(sa) * 80, L6_SX, L6_SX + L6_SS), constrain(scy + sin(sa) * 80, L6_SY, L6_SY + L6_SS));
    }
    noStroke();
    fill(90, 60, 130, 120);
    triangle(L6_SX, L6_SY + L6_SS, L6_SX + 26, L6_SY + L6_SS, L6_SX, L6_SY + L6_SS - 30);
    fill(25, 25, 30); rect(104, 153, 12, 22); ellipse(110, 176, 64, 12);
    // glass bits on the desk
    fill(170, 190, 220, 160);
    triangle(60, 190, 68, 186, 64, 196); triangle(150, 196, 158, 198, 152, 190); triangle(100, 206, 107, 204, 104, 212);
    // lamp
    fill(40, 40, 46); ellipse(34, 240, 50, 14);
    stroke(55, 55, 62); strokeWeight(5);
    line(34, 236, 22, 150); line(22, 150, 72, 92);
    noStroke();
    // shade: a cone tipped toward the desk
    pushMatrix();
    translate(74, 96);
    rotate(-30);
    fill(55, 55, 64);
    quad(-6, -12, 6, -12, 20, 12, -20, 12);
    fill(75, 75, 86);
    quad(-5, -11, -1, -11, -6, 11, -17, 11);
    if (l6Lamp) { fill(255, 245, 200); } else { fill(80, 80, 72); }
    ellipse(0, 12, 40, 9);
    if (l6Lamp) { fill(255, 255, 240); } else { fill(95, 95, 85); }
    ellipse(0, 12, 12, 6);
    fill(45, 45, 52);
    ellipse(0, -12, 12, 5);
    popMatrix();
    // lamp switch (red dot so you can find it in the dark)
    fill(l6Lamp ? 80 : 255, l6Lamp ? 200 : 40, 40);
    ellipse(34, 236, 7, 5);
    // laptop
    fill(60, 62, 70); quad(258, 190, 362, 190, 376, 214, 244, 214);
    fill(45, 46, 52); rect(264, 196, 92, 12, 2);
    fill(70, 72, 80); rect(262, 110, 96, 80, 3);
    if (l6Laptop.ready) {
        fill(20, 30, 60); rect(266, 114, 88, 72);
        fill(255, 230, 90, 170 + 60 * sin(frameCount * 6));
        textSize(12); textAlign(CENTER); text("LEVEL 7 >", 310, 154);
    } else if (l6Laptop.boot > 0) {
        fill(10, 10, 14); rect(266, 114, 88, 72);
        fill(200); textSize(7); textAlign(CENTER); text("reading LVL 7...", 310, 140);
        fill(40); rect(276, 150, 68, 6);
        var bp = min(1, l6Laptop.boot / 90);
        if (bp > 0.99 && l6Laptop.boot < 130) { bp = 0.99; }
        fill(40, 200, 150); rect(276, 150, 68 * bp, 6);
        fill(160); text(floor(bp * 100) + "%", 310, 168);
    } else {
        fill(8, 8, 12); rect(266, 114, 88, 72);
        fill(40, 200, 120, 80 + 80 * sin(frameCount * 3)); ellipse(354, 207, 3, 3);
    }
    // usb port on the laptop's side
    fill(20); rect(370, 200, 5, 7);
    // keyboard
    fill(40, 40, 46); rect(80, 232, 200, 42, 4);
    for (var ky = 0; ky < 3; ky++) {
        for (var kx = 0; kx < 14; kx++) {
            fill(l6Puddle > 0 && kx > 9 && ky > 0 && frameCount % 20 < 3 ? 255 : 70, 70, 80);
            rect(84 + kx * 14, 236 + ky * 12, 11, 9, 2);
        }
    }
    // mouse pad + a mouse (hey, that's you)
    fill(30, 60, 90); rect(300, 282, 76, 44, 5);
    fill(220, 220, 228); ellipse(338, 304, 18, 26);
    stroke(160); strokeWeight(1); line(338, 292, 338, 300); noStroke();
    // rubber duck
    var sq = l6Squeak > 0 ? 0.85 : 1;
    fill(255, 220, 40); ellipse(44, 306, 34 * (2 - sq), 22 * sq);
    ellipse(56, 290 + (1 - sq) * 6, 20, 18);
    fill(255, 140, 20); triangle(64, 290, 74, 293, 64, 296);
    fill(0); ellipse(59, 287, 3, 3);
    if (l6Squeak > 0) { l6Squeak--; fill(255); textSize(9); textAlign(CENTER); text("squeak!", 50, 270 - (20 - l6Squeak)); }
    // coffee puddle
    if (l6Puddle > 0) {
        fill(80, 45, 20, 220);
        ellipse(l6Mug.x - 16, l6Mug.y + 12, l6Puddle * 1.2, l6Puddle * 0.45);
        ellipse(l6Mug.x - 34, l6Mug.y + 16, l6Puddle * 0.6, l6Puddle * 0.25);
        fill(140, 90, 50, 120);
        ellipse(l6Mug.x - 22, l6Mug.y + 10, l6Puddle * 0.4, l6Puddle * 0.12);
    }
    // key
    if (l6Key.visible) {
        fill(210, 180, 70);
        ellipse(l6Key.x - 6, l6Key.y, 10, 10);
        fill(120, 80, 45); ellipse(l6Key.x - 6, l6Key.y, 4, 4);
        fill(210, 180, 70);
        rect(l6Key.x - 2, l6Key.y - 1.5, 14, 3);
        rect(l6Key.x + 8, l6Key.y, 2, 4); rect(l6Key.x + 4, l6Key.y, 2, 3);
    }
    // mug
    pushMatrix();
    translate(l6Mug.x, l6Mug.y);
    rotate(l6Mug.tilt);
    fill(0, 0, 0, 40); ellipse(2, 16, 32, 8);
    fill(230, 230, 235); rect(-14, -14, 28, 30, 4);
    noFill(); stroke(230, 230, 235); strokeWeight(4); arc(15, 1, 14, 16, -90, 90); noStroke();
    fill(90, 40, 140); rect(-14, -2, 28, 6);
    fill(l6Mug.spilled ? 60 : 90, l6Mug.spilled ? 35 : 50, 25);
    ellipse(0, -14, 26, 7);
    popMatrix();
    if (!l6Mug.spilled && frameCount % 12 === 0) { burst(l6Mug.x + random(-5, 5), l6Mug.y - 20, 200, 200, 200, 1, 0.4, -0.04); }
    // usb (once it's out of the drawer)
    if (l6Usb.visible && (l6Usb.x !== 0 || l6Usb.inPort)) {
        fill(40, 40, 50); rect(l6Usb.x - 11, l6Usb.y - 6, 22, 12, 2);
        fill(190, 190, 200); rect(l6Usb.x - 17, l6Usb.y - 3, 6, 6);
        fill(255); textSize(6); textAlign(CENTER); text("LVL 7", l6Usb.x, l6Usb.y + 3);
    }
    // lighting
    if (!l6Lamp) {
        fill(0, 0, 10, 195); rect(0, 0, 400, 400);
        fill(255, 40, 40, 150); ellipse(34, 236, 7, 5);
        fill(255, 40, 40, 40); ellipse(34, 236, 20, 14);
    } else {
        fill(255, 230, 150, 28);
        triangle(80, 107, 30, 330, 290, 330);
        fill(0, 0, 10, 50); rect(0, 0, 400, 400);
        fill(255, 230, 150, 20); ellipse(140, 270, 360, 200);
    }
};

var drawLevel6 = function() {
    l6T++;
    if (l6Phase === 0) {
        drawL6Desktop();
        drawL6Cracks(1);
        return;
    }
    if (l6Phase === 1) {
        background(0);
        drawL6Shards();
        if (l6T > 70) { l6Phase = 2; l6T = 0; }
        return;
    }
    if (l6Phase === 2) {
        // pull back out through the broken monitor
        var k = min(1, l6T / 80);
        k = k * k * (3 - 2 * k);
        var s0 = 400 / L6_SS;
        var s = s0 + (1 - s0) * k;
        background(0);
        pushMatrix();
        translate(-L6_SX * s0 * (1 - k), -L6_SY * s0 * (1 - k));
        scale(s);
        drawL6Desk();
        popMatrix();
        if (l6T >= 80) { l6Phase = 3; l6T = 0; }
        return;
    }
    // ---- the desk ----
    drawL6Desk();
    // shaking the mug
    if (draggingBtn === l6Mug) {
        var vx = l6Mug.x - l6Mug.px;
        l6Mug.tilt += (constrain(vx * 4, -40, 40) - l6Mug.tilt) * 0.3;
        if (!l6Mug.spilled) {
            if (abs(vx) > 3 && ((vx > 0) !== (l6Mug.lastVX > 0))) { l6Mug.energy += 1; }
            if (abs(vx) > 5) { burst(l6Mug.x, l6Mug.y - 14, 90, 50, 25, 2, 2, 0.2); }
            if (abs(vx) > 0.5) { l6Mug.lastVX = vx; }
            if (l6Mug.energy >= 7) {
                l6Mug.spilled = 1;
                l6Key.visible = 1; l6Key.x = l6Mug.x - 40; l6Key.y = l6Mug.y + 14;
                burst(l6Mug.x - 10, l6Mug.y, 90, 50, 25, 30, 3.5, 0.2);
                burst(l6Key.x, l6Key.y, 255, 230, 120, 12, 2.5, 0.05);
                shake(3);
            }
        }
    } else {
        l6Mug.tilt *= 0.8;
    }
    l6Mug.energy *= 0.995;
    l6Mug.px = l6Mug.x;
    if (l6Mug.spilled && l6Puddle < 50) { l6Puddle += 1.5; }
    // drawer sliding open
    if (l6Drawer.open && l6Drawer.slide < 30) { l6Drawer.slide += 1.5; }
    // laptop booting
    if (l6Usb.inPort && !l6Laptop.ready) {
        l6Laptop.boot++;
        if (l6Laptop.boot > 150) {
            l6Laptop.ready = 1;
            flash(255, 230, 120, 60);
            burst(310, 150, 255, 230, 120, 24, 3, 0);
        }
    }
};

var level6MousePressed = function() {
    if (l6Phase === 0) {
        addL6Crack(mouseX, mouseY);
        shake(4 + l6Cracks.length * 2);
        burst(mouseX, mouseY, 220, 235, 255, 14, 3, 0.1);
        if (l6Cracks.length >= 4) {
            makeL6Shards();
            l6Phase = 1; l6T = 0;
            shake(14); flash(255, 255, 255, 180);
        }
        return;
    }
    if (l6Phase !== 3) { return; }
    // lamp switch works in the dark
    if (dist(mouseX, mouseY, 34, 236) < 16) {
        l6Lamp = 1 - l6Lamp;
        return;
    }
    if (!l6Lamp) { return; } // too dark to find anything else
    if (l6Laptop.ready && mouseX >= 262 && mouseX <= 358 && mouseY >= 110 && mouseY <= 190) {
        level = 7;
        initLevel7();
        return;
    }
    if (l6Usb.visible && !l6Usb.inPort) {
        var ux = l6Usb.x === 0 ? 200 : l6Usb.x;
        var uy = l6Usb.x === 0 ? 358 + l6Drawer.slide * 0.4 : l6Usb.y;
        if (abs(mouseX - ux) < 18 && abs(mouseY - uy) < 10) {
            l6Usb.x = ux; l6Usb.y = uy;
            draggingBtn = l6Usb;
            dragOffsetX = mouseX - l6Usb.x; dragOffsetY = mouseY - l6Usb.y;
            return;
        }
    }
    if (l6Key.visible && dist(mouseX, mouseY, l6Key.x, l6Key.y) < 14) {
        draggingBtn = l6Key;
        dragOffsetX = mouseX - l6Key.x; dragOffsetY = mouseY - l6Key.y;
        return;
    }
    if (abs(mouseX - l6Mug.x) < 18 && abs(mouseY - l6Mug.y) < 18) {
        draggingBtn = l6Mug;
        dragOffsetX = mouseX - l6Mug.x; dragOffsetY = mouseY - l6Mug.y;
        l6Mug.px = l6Mug.x;
        return;
    }
    if (dist(mouseX, mouseY, 46, 302) < 20) { l6Squeak = 20; return; }
    if (dist(mouseX, mouseY, 338, 304) < 14) { l6Notes.push(1); burst(338, 300, 255, 255, 255, 6, 1.5, 0); return; }
};

var level6MouseDragged = function() {
    if (draggingBtn !== -1 && draggingBtn.x !== undefined) {
        draggingBtn.x = constrain(mouseX - dragOffsetX, 10, 390);
        draggingBtn.y = constrain(mouseY - dragOffsetY, 170, 392);
    }
};

var level6MouseReleased = function() {
    if (draggingBtn === l6Key && !l6Drawer.open) {
        if (dist(l6Key.x, l6Key.y, 200, 376) < 20) {
            l6Drawer.open = 1;
            l6Key.visible = 0;
            l6Usb.visible = 1;
            shake(2);
            burst(200, 374, 255, 230, 120, 10, 2, 0.05);
        }
    }
    if (draggingBtn === l6Usb) {
        if (dist(l6Usb.x - 15, l6Usb.y, 372, 203) < 18) {
            l6Usb.inPort = 1;
            l6Usb.x = 384; l6Usb.y = 203;
            burst(372, 203, 120, 255, 200, 10, 2, 0);
        }
    }
    draggingBtn = -1;
};


// ============ LEVEL 5 - LOADING... ============
var L5_BX = 60;   // bar frame
var L5_BY = 190;
var L5_BW = 280;
var L5_BH = 24;
var l5Fill = 0;             // 0..1
var l5Pixel = {x: 0, y: 0, stuck: 1};
var l5Spin = {x: 200, y: 262, homeX: 200, homeY: 262, a: 0};
var l5Cap = {weak: 0, hp: 90, broken: 0, bulge: 0, flyX: 0, flyY: 0, flyVX: 0, flyVY: 0, flyR: 0};
var l5Strain = 0;
var l5Pool = 0;             // height of the spilled loading
var l5Done = 0;
var l5Enter = {x: 200, y: 400, visible: 0, sink: 0, t: 0};
var l5Tips = [
    "Tip: loading bars are mostly decorative.",
    "Tip: have you tried not waiting?",
    "Tip: some pixels are stubborn.",
    "Tip: 99% is basically 100%. Basically.",
    "Tip: this tip is also loading."
];

var l5Percent = function() {
    if (l5Done) { return "100%"; }
    if (l5Cap.broken) { return (99.9 + min(0.09, l5Pool / 1500)).toFixed(2) + "%"; }
    if (l5Cap.weak) { return "99.9%"; }
    if (l5Strain > 0 && l5Strain % 8 < 4) { return "99.4%"; }
    return floor(l5Fill * 100) + "%";
};

var drawL5Spinner = function(x, y, speed) {
    l5Spin.a += speed;
    noStroke();
    for (var i = 0; i < 8; i++) {
        var a = i * 45 + l5Spin.a;
        fill(120, 230, 255, 60 + i * 24);
        var sz = 5 + i * 0.6;
        ellipse(x + cos(a) * 14, y + sin(a) * 14, sz, sz);
    }
};

// ---- Level 5, part 2: down into the loading ----
var L5_FLOOR = 1300;
var l5Phase = 0;   // 0 loading, 1 ENTER floating/sinking, 2 diving, 3 draining, 4 drained
var l5T = 0;
var l5Cam = 0;
var l5Surf = 250;
var l5Hold = 0;
var l5Diver = {x: 200, y: 150, vx: 0, vy: 0, face: 1};
var l5Shovel = {x: 88, y: 770, vy: 0, held: 0, used: 0, ang: -20};
var l5Ring = {x: 262, y: 1250, held: 0};
var l5Plug = {x: 262, y: 1291, out: 0, pry: 0, vy: 0, jig: 0};
var l5EnterW = {x: 150, y: 1284};
var l5Bubbles = [];
var l5Glubs = [];
var l5Ledges = [[18, 150, 782], [250, 382, 545]];
var l5Weeds = [[30, 782, 5], [130, 782, 4], [265, 545, 4], [360, 545, 6], [40, 1300, 7], [110, 1300, 5], [215, 1300, 4], [320, 1300, 8], [375, 1300, 5]];

var resetL5Dive = function() {
    l5Phase = 0; l5T = 0; l5Cam = 0; l5Surf = 250; l5Hold = 0;
    l5Diver = {x: 200, y: 150, vx: 0, vy: 0, face: 1};
    l5Shovel = {x: 88, y: 770, vy: 0, held: 0, used: 0, ang: -20};
    l5Ring = {x: 262, y: 1250, held: 0};
    l5Plug = {x: 262, y: 1291, out: 0, pry: 0, vy: 0, jig: 0};
    l5Bubbles = []; l5Glubs = [];
};

var l5WaterCol = function(y) {
    var k = constrain((y - 250) / (L5_FLOOR - 250), 0, 1);
    return [30 - 22 * k, 170 - 125 * k, 130 - 85 * k];
};

var drawL5ShovelAt = function(x, y, ang) {
    pushMatrix();
    translate(x, y);
    rotate(ang);
    stroke(79, 57, 0); strokeWeight(4);
    line(-24, 0, 0, 0);
    noStroke();
    fill(55, 40, 0);
    rect(-29, -4, 6, 8);
    fill(190, 190, 195);
    arc(2, 0, 28, 22, -90, 90);
    fill(235, 235, 240);
    arc(2, -2, 18, 12, -90, 0);
    popMatrix();
};

var drawL5Diver = function() {
    var d = l5Diver;
    var swim = l5Hold && draggingBtn === -1 && d.y > l5Surf && l5Phase === 2;
    var kick = sin(frameCount * (swim ? 18 : 5)) * (swim ? 5 : 2);
    pushMatrix();
    translate(d.x, d.y);
    scale(d.face, 1);
    noStroke();
    // flippers
    fill(40, 60, 200);
    triangle(-12, 4, -22, 0 + kick, -22, 8 + kick);
    triangle(-12, 8, -22, 6 - kick, -22, 14 - kick);
    // body
    fill(250, 200, 40);
    ellipse(-4, 6, 18, 12);
    // air tank
    fill(160, 160, 170);
    rect(-10, -2, 8, 8, 2);
    // arm reaching forward
    stroke(250, 200, 40); strokeWeight(3);
    line(2, 6, 10, swim ? 2 : 9);
    noStroke();
    // helmet
    fill(200, 240, 255, 120);
    ellipse(6, -2, 16, 16);
    fill(255, 220, 190);
    ellipse(6, -2, 9, 9);
    fill(0);
    ellipse(8, -3, 2, 2);
    fill(255, 255, 255, 180);
    ellipse(3, -6, 4, 3);
    popMatrix();
};

var drawL5Dive = function() {
    l5T++;
    var D = l5Diver;
    // ---- diver physics ----
    var inWater = D.y > l5Surf;
    if (inWater) {
        if (l5Hold && draggingBtn === -1 && l5Phase === 2) {
            var tx = mouseX; var ty = mouseY + l5Cam;
            var dd = max(1, dist(D.x, D.y, tx, ty));
            if (dd > 6) {
                D.vx += (tx - D.x) / dd * 0.35;
                D.vy += (ty - D.y) / dd * 0.35;
            }
            if (frameCount % 6 === 0) { l5Bubbles.push({x: D.x - D.face * 18, y: D.y + 6, s: random(2, 4)}); }
        } else {
            D.vy += 0.03;
        }
        D.vx *= 0.92; D.vy *= 0.92;
        var sp = sqrt(D.vx * D.vx + D.vy * D.vy);
        if (sp > 3.2) { D.vx *= 3.2 / sp; D.vy *= 3.2 / sp; }
    } else {
        D.vy += 0.4;
        D.vx *= 0.96;
    }
    var wasAbove = D.y <= l5Surf;
    D.x += D.vx; D.y += D.vy;
    if (wasAbove && D.y > l5Surf && D.vy > 1.5) {
        burst(D.x, l5Surf, 120, 255, 210, 26, 4, 0.2);
        D.vy *= 0.35;
    }
    if (abs(D.vx) > 0.2) { D.face = D.vx > 0 ? 1 : -1; }
    D.x = constrain(D.x, 14, 386);
    if (D.y < l5Surf + 8 && l5Phase === 2 && D.y > l5Surf - 30 && inWater) { D.y = l5Surf + 8; D.vy = max(0, D.vy); }
    // land on ledges and the floor
    for (var li = 0; li < l5Ledges.length; li++) {
        var L = l5Ledges[li];
        if (D.x > L[0] && D.x < L[1] && D.y + 12 > L[2] && D.y + 12 < L[2] + 14 && D.vy > 0) { D.y = L[2] - 12; D.vy = 0; }
    }
    if (D.y > L5_FLOOR - 12) { D.y = L5_FLOOR - 12; D.vy = 0; }
    // camera follows you down
    var camT = constrain(D.y - 180, 0, L5_FLOOR + 20 - 400);
    l5Cam += (camT - l5Cam) * 0.08;

    // ---- the shovel sinks if you let go of it ----
    if (!l5Shovel.held && !l5Shovel.used) {
        var rest = L5_FLOOR - 6;
        for (var sl = 0; sl < l5Ledges.length; sl++) {
            var LL = l5Ledges[sl];
            if (l5Shovel.x > LL[0] && l5Shovel.x < LL[1] && l5Shovel.y <= LL[2] - 6) { rest = min(rest, LL[2] - 6); }
        }
        if (l5Shovel.y < rest) { l5Shovel.y = min(rest, l5Shovel.y + 1.2); }
    }
    // ---- chain ring springs back ----
    var anchorX = l5Plug.x; var anchorY = l5Plug.y - 38;
    if (!l5Ring.held && !l5Plug.out) {
        l5Ring.x += (anchorX - l5Ring.x) * 0.2;
        l5Ring.y += (anchorY - l5Ring.y) * 0.2;
    }
    if (l5Ring.held && !l5Plug.out) {
        var rd = dist(l5Ring.x, l5Ring.y, anchorX, anchorY);
        if (rd > 30) {
            // yanking it just rattles the plug
            l5Plug.jig = 6;
            if (frameCount % 8 === 0) { shake(1.2); burst(l5Plug.x, l5Plug.y, 180, 255, 230, 2, 1, -0.05); }
        }
        if (rd > 45) {
            l5Ring.x = anchorX + (l5Ring.x - anchorX) / rd * 45;
            l5Ring.y = anchorY + (l5Ring.y - anchorY) / rd * 45;
        }
    }
    if (l5Plug.jig > 0) { l5Plug.jig--; }
    // ---- prying the plug with the shovel ----
    if (l5Shovel.used && !l5Plug.out) {
        l5Plug.pry++;
        l5Shovel.x = l5Plug.x - 24; l5Shovel.y = l5Plug.y - 4;
        l5Shovel.ang = -10 - min(35, l5Plug.pry * 0.7);
        if (l5Plug.pry % 10 === 0) { shake(2); burst(l5Plug.x, l5Plug.y, 200, 200, 190, 4, 1.5, -0.05); }
        if (l5Plug.pry >= 60) {
            l5Plug.out = 1; l5Plug.vy = -3.5;
            l5Phase = 3;
            shake(10); flash(160, 255, 220, 80);
            burst(l5Plug.x, l5Plug.y, 160, 255, 220, 40, 4, -0.05);
        }
    }
    if (l5Plug.out) {
        l5Plug.y += l5Plug.vy;
        if (l5Plug.y > l5Surf) { l5Plug.vy = max(-3.5, l5Plug.vy - 0.02); }
        else { l5Plug.vy += 0.4; if (l5Plug.y > L5_FLOOR - 10) { l5Plug.y = L5_FLOOR - 10; l5Plug.vy = 0; } }
    }
    // ---- draining ----
    if (l5Phase === 3) {
        l5Surf += 2.2 + (l5Surf - 250) * 0.004;
        if (l5Surf >= L5_FLOOR + 4) { l5Surf = L5_FLOOR + 4; l5Phase = 4; shake(4); }
        if (frameCount % 2 === 0 && l5Surf < L5_FLOOR) {
            var wa = random(0, 360); var wr = random(20, 70);
            burst(l5Plug.x + 0 + cos(wa) * wr, min(L5_FLOOR - 8, max(l5Surf + 4, L5_FLOOR - 20)) + sin(wa) * 6, 120, 255, 210, 1, 1.2, 0);
        }
    }

    // ================= draw =================
    background(14, 16, 24);
    pushMatrix();
    translate(0, -l5Cam);
    noStroke();
    // the loading screen, far above
    fill(140, 255, 200);
    textAlign(CENTER);
    textSize(20);
    text("LOAD COMPLETE", 200, 165);
    fill(30, 34, 48);
    rect(L5_BX, L5_BY, L5_BW, L5_BH, 4);
    fill(40, 200, 150);
    rect(L5_BX + 2, L5_BY + 2, L5_BW - 4, L5_BH - 4, 3);
    fill(200, 210, 240);
    textSize(13);
    text("100%", 200, 236);
    // back wall of the drained pit (only matters once it drains)
    fill(22, 26, 34);
    rect(0, 260, 400, L5_FLOOR - 260);
    fill(28, 32, 42);
    for (var bw = 300; bw < L5_FLOOR; bw += 60) { rect(0, bw, 400, 2); }
    // the loading liquid
    for (var wy = max(l5Surf, l5Cam - 40); wy < min(L5_FLOOR + 60, l5Cam + 440); wy += 20) {
        var wc = l5WaterCol(wy);
        fill(wc[0], wc[1], wc[2], 235);
        rect(0, max(wy, l5Surf), 400, 20 - max(0, l5Surf - wy));
    }
    // light rays from the surface
    if (l5Surf < 700) {
        for (var r = 0; r < 4; r++) {
            var rx = 60 + r * 95 + sin(frameCount + r * 50) * 12;
            fill(180, 255, 230, 16);
            quad(rx, l5Surf, rx + 30, l5Surf, rx + 90, l5Surf + 420, rx + 30, l5Surf + 420);
        }
    }
    // ledges
    for (var ld = 0; ld < l5Ledges.length; ld++) {
        var Lg = l5Ledges[ld];
        fill(40, 50, 55);
        rect(Lg[0], Lg[2], Lg[1] - Lg[0], 20, 6);
        fill(55, 68, 72);
        rect(Lg[0] + 4, Lg[2], Lg[1] - Lg[0] - 8, 5, 3);
        fill(40, 50, 55);
        triangle(Lg[0] + 10, Lg[2] + 18, Lg[1] - 10, Lg[2] + 18, (Lg[0] + Lg[1]) / 2, Lg[2] + 46);
    }
    // floor
    fill(35, 42, 40);
    rect(0, L5_FLOOR, 400, 140);
    fill(48, 58, 54);
    for (var fb = 0; fb < 14; fb++) { ellipse(fb * 30 + 10, L5_FLOOR + 2, 36, 10); }
    // seaweed made of little loading-bar segments
    for (var sw = 0; sw < l5Weeds.length; sw++) {
        var W = l5Weeds[sw];
        for (var seg = 0; seg < W[2]; seg++) {
            var wet = W[1] - seg * 12 > l5Surf;
            var sway = wet ? sin(frameCount * 2 + sw * 40 + seg * 25) * seg * 1.6 : seg * 2;
            fill(wet ? 50 : 60, wet ? 190 - seg * 10 : 90, wet ? 120 : 60);
            rect(W[0] + sway - 3, W[1] - seg * 12 - 11, 6, 11, 2);
        }
    }
    // ---- sunken leftovers ----
    // the stuck pixel, bobbing about
    fill(92, 88, 104);
    var pxY = l5Surf < 420 ? 420 + sin(frameCount * 2) * 4 : L5_FLOOR - 4;
    rect(140, pxY - 3, 6, 6);
    // the open safe from level 4, on the right ledge
    fill(80, 85, 95);
    rect(292, 505, 56, 40, 3);
    fill(30, 30, 36);
    rect(297, 510, 46, 30, 2);
    fill(110, 116, 128);
    quad(292, 505, 278, 500, 278, 548, 292, 545);
    fill(200, 170, 60);
    rect(281, 518, 3, 10);
    // werewolf bones on a mound
    fill(40, 48, 46);
    ellipse(300, 985, 150, 40);
    fill(230, 225, 205);
    stroke(230, 225, 205); strokeWeight(3);
    for (var rb = 0; rb < 4; rb++) { arc(262 + rb * 12, 968, 10, 18, 180, 360); }
    line(255, 968, 305, 968);
    noStroke();
    ellipse(328, 958, 30, 24);
    triangle(336, 958, 356, 954, 342, 968);
    triangle(320, 948, 326, 932, 332, 948);
    fill(20, 30, 30);
    ellipse(324, 955, 7, 7);
    ellipse(334, 955, 6, 6);
    if (l5Surf < 950 && frameCount % 50 === 0) { l5Bubbles.push({x: 324, y: 952, s: 3}); }
    // THE END plate, tipped over on the floor
    pushMatrix();
    translate(70, L5_FLOOR - 16);
    rotate(-12);
    fill(235, 235, 235);
    rect(-50, -22, 100, 44);
    fill(20);
    textSize(19);
    text("THE END", 0, 7);
    popMatrix();
    // the loading bar's end cap
    pushMatrix();
    translate(345, L5_FLOOR - 8);
    rotate(70);
    fill(110, 120, 150);
    rect(-6, -16, 12, 32, 3);
    popMatrix();
    // drain: grate + plug + chain
    fill(20, 22, 24);
    ellipse(262, L5_FLOOR + 1, 50, 14);
    if (!l5Plug.out) {
        var jx = l5Plug.jig > 0 ? random(-2, 2) : 0;
        fill(90, 70, 50);
        ellipse(l5Plug.x + jx, l5Plug.y, 42, 14);
        fill(110, 88, 64);
        ellipse(l5Plug.x + jx, l5Plug.y - 3, 38, 10);
        // chain
        stroke(170, 170, 160); strokeWeight(2); noFill();
        var cx0 = l5Plug.x + jx; var cy0 = l5Plug.y - 6;
        for (var ch = 0; ch < 6; ch++) {
            var t0 = ch / 6; var t1 = (ch + 1) / 6;
            var sag = sin(t0 * 180) * 4;
            ellipse(cx0 + (l5Ring.x - cx0) * (t0 + t1) / 2 + sag, cy0 + (l5Ring.y - cy0) * (t0 + t1) / 2, 4, 6);
        }
        strokeWeight(3);
        ellipse(l5Ring.x, l5Ring.y, 14, 14);
        noStroke();
    } else {
        // swirl + the plug drifting away
        if (l5Phase === 3) {
            noFill();
            for (var sp2 = 0; sp2 < 4; sp2++) {
                stroke(180, 255, 230, 110 - sp2 * 22); strokeWeight(2);
                var swR = 12 + sp2 * 14 + (frameCount % 14);
                arc(262, L5_FLOOR - 4, swR * 2, swR * 0.5, frameCount * 8 + sp2 * 60, frameCount * 8 + sp2 * 60 + 220);
            }
            noStroke();
        }
        fill(90, 70, 50);
        ellipse(l5Plug.x + 40, l5Plug.y, 42, 14);
    }
    // the sunken ENTER button, tipped next to the drain
    pushMatrix();
    translate(l5EnterW.x, l5EnterW.y);
    rotate(l5Phase === 4 ? -4 : -8);
    fill(0, 0, 0, 60);
    rect(-48, -10, 100, 28, 6);
    fill(l5Phase === 4 ? 245 : 205, 255, l5Phase === 4 ? 250 : 230);
    rect(-50, -14, 100, 28, 6);
    fill(30, 120, 90);
    textSize(14);
    text("ENTER", 0, 5);
    popMatrix();
    if (l5Phase === 4) {
        fill(255, 255, 200, 40 + 30 * sin(frameCount * 5));
        ellipse(l5EnterW.x, l5EnterW.y, 130, 50);
    }
    // shovel
    drawL5ShovelAt(l5Shovel.x, l5Shovel.y, l5Shovel.held ? -35 : l5Shovel.ang);
    // you
    drawL5Diver();
    // bubbles
    for (var b = l5Bubbles.length - 1; b >= 0; b--) {
        var bu = l5Bubbles[b];
        bu.y -= 1.1; bu.x += sin(frameCount * 6 + b * 30) * 0.4;
        if (bu.y < l5Surf) { l5Bubbles.splice(b, 1); continue; }
        noFill(); stroke(200, 255, 240, 170); strokeWeight(1);
        ellipse(bu.x, bu.y, bu.s * 2, bu.s * 2);
        noStroke();
    }
    // glub glub
    for (var g = l5Glubs.length - 1; g >= 0; g--) {
        var gl = l5Glubs[g];
        gl.life--; gl.y -= 0.6;
        fill(220, 255, 240, gl.life * 5);
        textSize(11);
        text("glub", gl.x, gl.y);
        if (gl.life <= 0) { l5Glubs.splice(g, 1); }
    }
    // surface line
    if (l5Surf < L5_FLOOR) {
        fill(140, 255, 210, 120);
        for (var sx = 0; sx < 400; sx += 20) { rect(sx, l5Surf + sin(frameCount * 4 + sx * 2) * 2 - 1, 14, 2); }
    }
    popMatrix();
    // depth readout
    fill(160, 220, 200, 150);
    textSize(9);
    textAlign(RIGHT);
    text("depth " + max(0, floor((D.y - 250) / 10)) + "m", 392, 14);
    textAlign(CENTER);
};

var level5DivePressed = function() {
    var wx = mouseX; var wy = mouseY + l5Cam;
    if (l5Phase === 4) {
        if (abs(wx - l5EnterW.x) < 52 && abs(wy - l5EnterW.y) < 18) { level = 6; initLevel6(); }
        return;
    }
    var reach = 95;
    // grab the chain ring
    if (!l5Plug.out && dist(wx, wy, l5Ring.x, l5Ring.y) < 12 && dist(l5Diver.x, l5Diver.y, l5Ring.x, l5Ring.y) < reach) {
        l5Ring.held = 1; draggingBtn = l5Ring;
        dragOffsetX = wx - l5Ring.x; dragOffsetY = wy - l5Ring.y;
        return;
    }
    // grab the shovel
    if (!l5Shovel.used && dist(wx, wy, l5Shovel.x, l5Shovel.y) < 22 && dist(l5Diver.x, l5Diver.y, l5Shovel.x, l5Shovel.y) < reach) {
        l5Shovel.held = 1; draggingBtn = l5Shovel;
        dragOffsetX = wx - l5Shovel.x; dragOffsetY = wy - l5Shovel.y;
        return;
    }
    // poking ENTER underwater does nothing but bubbles
    if (abs(wx - l5EnterW.x) < 52 && abs(wy - l5EnterW.y) < 18) {
        l5Glubs.push({x: l5EnterW.x, y: l5EnterW.y - 22, life: 45});
        for (var i = 0; i < 4; i++) { l5Bubbles.push({x: l5EnterW.x + random(-30, 30), y: l5EnterW.y - 10, s: random(2, 4)}); }
    }
    // otherwise, swim
    l5Hold = 1;
};

var level5DiveDragged = function() {
    if (draggingBtn === l5Ring || draggingBtn === l5Shovel) {
        draggingBtn.x = mouseX - dragOffsetX;
        draggingBtn.y = mouseY + l5Cam - dragOffsetY;
    }
};

var level5DiveReleased = function() {
    if (draggingBtn === l5Shovel) {
        l5Shovel.held = 0;
        // blade near the plug? wedge it in and pry
        if (!l5Plug.out && dist(l5Shovel.x, l5Shovel.y, l5Plug.x, l5Plug.y) < 36) {
            l5Shovel.used = 1; l5Plug.pry = 0;
        }
    }
    if (draggingBtn === l5Ring) { l5Ring.held = 0; }
    draggingBtn = -1;
    l5Hold = 0;
};

var initLevel5 = function() {
    l5Fill = 0;
    l5Pixel = {x: L5_BX + 2 + (L5_BW - 4) * 0.99 - 3, y: L5_BY + 9, stuck: 1};
    l5Spin = {x: 200, y: 262, homeX: 200, homeY: 262, a: 0};
    l5Cap = {weak: 0, hp: 90, broken: 0, bulge: 0, flyX: 0, flyY: 0, flyVX: 0, flyVY: 0, flyR: 0};
    l5Strain = 0; l5Pool = 0; l5Done = 0;
    l5Enter = {x: 200, y: 400, visible: 0, sink: 0, t: 0};
    resetL5Dive();
};
initLevel5();

var drawLevel5 = function() {
    if (l5Phase >= 2) { drawL5Dive(); return; }
    background(14, 16, 24);
    noStroke();
    // subtle scanlines
    fill(255, 255, 255, 6);
    for (var sl = 0; sl < 400; sl += 4) { rect(0, sl, 400, 1); }
    var capX = L5_BX + L5_BW;
    var capY = L5_BY + L5_BH / 2;
    var shakeBar = (l5Strain > 0) ? random(-1.5, 1.5) : 0;
    if (l5Cap.weak && !l5Cap.broken) { shakeBar = random(-0.8, 0.8); }
    // title
    fill(220, 230, 255);
    textAlign(CENTER);
    textSize(20);
    var dots = "...".substring(0, floor(frameCount / 20) % 4);
    if (!l5Done) { text("LOADING" + dots, 200, 165); }
    else { fill(140, 255, 200); text("LOAD COMPLETE", 200, 165); }
    // bar frame
    pushMatrix();
    translate(shakeBar, 0);
    fill(30, 34, 48);
    rect(L5_BX, L5_BY, L5_BW, L5_BH, 4);
    // fill
    var fw = (L5_BW - 4) * l5Fill;
    if (l5Cap.weak) { fw = L5_BW - 4; }
    fill(40, 200, 150);
    rect(L5_BX + 2, L5_BY + 2, fw, L5_BH - 4, 3);
    fill(120, 255, 210, 140);
    rect(L5_BX + 2, L5_BY + 3, fw, 5, 3);
    // moving shine on the fill
    var shx = L5_BX + 2 + ((frameCount * 3) % 300) - 20;
    if (shx > L5_BX && shx < L5_BX + fw - 14) {
        fill(255, 255, 255, 50);
        rect(shx, L5_BY + 2, 14, L5_BH - 4);
    }
    // the stuck pixel (while it's still jammed in)
    if (l5Pixel.stuck && draggingBtn !== l5Pixel) {
        fill(92, 88, 104);
        rect(l5Pixel.x, l5Pixel.y - 3, 6, 6);
    }
    // frame outline
    noFill();
    stroke(90, 100, 130); strokeWeight(2);
    rect(L5_BX, L5_BY, L5_BW, L5_BH, 4);
    noStroke();
    // end cap
    if (!l5Cap.broken) {
        if (l5Cap.weak && l5Cap.bulge < 1) { l5Cap.bulge += 0.02; }
        var bg = l5Cap.bulge * 7;
        fill(110, 120, 150);
        rect(capX - 4, L5_BY - 4, 10 + bg * 0.5, L5_BH + 8, 3);
        if (l5Cap.weak) {
            fill(110, 120, 150);
            ellipse(capX + 5 + bg * 0.4, capY, 8 + bg, L5_BH + 2);
            // cracks, more as it gets ground down
            var dmg = 1 - l5Cap.hp / 90;
            stroke(30, 30, 40); strokeWeight(1);
            line(capX + 2, L5_BY - 2, capX + 5, capY - 3);
            line(capX + 5, capY - 3, capX + 3, capY + 4);
            if (dmg > 0.3) { line(capX + 3, capY + 4, capX + 8, L5_BY + L5_BH + 2); }
            if (dmg > 0.6) { line(capX + 5, capY - 3, capX + 10, capY - 8); line(capX + 1, capY + 1, capX + 9, capY + 2); }
            noStroke();
            // green seeping through
            fill(60, 230, 170, 60 + 60 * sin(frameCount * 6));
            ellipse(capX + 4, capY, 4, 10);
        }
    }
    popMatrix();
    // flying cap after it breaks
    if (l5Cap.broken && l5Cap.flyY < 460) {
        l5Cap.flyX += l5Cap.flyVX; l5Cap.flyY += l5Cap.flyVY; l5Cap.flyVY += 0.35; l5Cap.flyR += 12;
        pushMatrix();
        translate(l5Cap.flyX, l5Cap.flyY);
        rotate(l5Cap.flyR);
        fill(110, 120, 150);
        rect(-6, -16, 12, 32, 3);
        popMatrix();
    }
    // percent
    fill(200, 210, 240);
    textSize(13);
    textAlign(CENTER);
    text(l5Percent(), 200, 236);
    // loading spills out and fills the screen
    if (l5Cap.broken) {
        if (!l5Done) { l5Pool += 0.55; }
        var surf = 400 - l5Pool;
        // stream from the broken end
        var streamW = 10 + sin(frameCount * 9) * 2;
        fill(40, 200, 150, 230);
        if (!l5Done) {
            rect(capX, capY - 5, 10, 10);
            beginShape();
            vertex(capX + 6, capY - 5);
            bezierVertex(capX + 30, capY - 5, capX + 34, capY + 20, capX + 34, capY + 40);
            vertex(capX + 34 + streamW, surf);
            vertex(capX + 34, surf);
            vertex(capX + 30 - streamW * 0.5, capY + 40);
            bezierVertex(capX + 28, capY + 10, capX + 20, capY + 5, capX + 6, capY + 5);
            endShape(CLOSE);
            if (frameCount % 3 === 0) { burst(capX + 38, surf, 90, 255, 200, 2, 1.8, 0.12); }
        }
        // pool with a wavy surface
        fill(30, 170, 130, 220);
        beginShape();
        vertex(0, 400);
        for (var wx = 0; wx <= 400; wx += 20) {
            vertex(wx, surf + sin(frameCount * 4 + wx * 2) * 3);
        }
        vertex(400, 400);
        endShape(CLOSE);
        fill(120, 255, 210, 90);
        for (var wx2 = 0; wx2 < 400; wx2 += 20) {
            rect(wx2, surf + sin(frameCount * 4 + wx2 * 2) * 3 - 1, 12, 2);
        }
        // little bubbles
        fill(180, 255, 230, 120);
        for (var bb = 0; bb < 6; bb++) {
            var bx = (bb * 71 + frameCount * 0.7) % 400;
            var by = 400 - ((frameCount * (0.6 + bb * 0.1) + bb * 50) % max(1, l5Pool));
            ellipse(bx, by, 4, 4);
        }
        if (l5Pool >= 150 && !l5Done) {
            l5Phase = 1;
            l5Done = 1;
            l5Enter.visible = 1; l5Enter.y = 420;
            flash(140, 255, 200, 110);
            burst(200, 236, 140, 255, 200, 40, 4, 0.02);
        }
    }
    // the ENTER button floats up... then sinks
    if (l5Enter.visible) {
        var surfY = 400 - l5Pool;
        l5Enter.t++;
        if (l5Enter.t > 130 && !l5Enter.sink) { l5Enter.sink = 1; }
        if (!l5Enter.sink) {
            l5Enter.y += (surfY - 14 - l5Enter.y) * 0.05;
        } else {
            l5Enter.y += 0.9;
            if (frameCount % 5 === 0) { burst(200 + random(-40, 40), l5Enter.y - 10, 180, 255, 230, 1, 0.8, -0.05); }
        }
        var ey = l5Enter.y + (l5Enter.sink ? 0 : sin(frameCount * 3) * 3);
        var wob = l5Enter.sink ? sin(frameCount * 6) * 4 : 0;
        pushMatrix();
        translate(200, ey);
        rotate(wob);
        fill(0, 0, 0, 60);
        rect(-48, 3, 100, 30, 6);
        fill(235, 255, 245);
        rect(-50, -15, 100, 30, 6);
        fill(30, 120, 90);
        textSize(14);
        text("ENTER", 0, 5);
        popMatrix();
        // the liquid closes over it
        if (l5Enter.sink && ey > surfY - 16) {
            fill(30, 170, 130, min(230, (ey - surfY + 16) * 6));
            rect(148, max(surfY, ey - 17), 104, 36);
        }
        if (l5Enter.sink && l5Enter.t % 40 === 0) { l5Glubs.push({x: 200, y: surfY - 8, life: 45}); }
        // once it's gone, in you go
        if (l5Enter.sink && l5Enter.y > surfY + 90 && l5Phase < 2) {
            l5Phase = 2;
            l5Diver.x = 200; l5Diver.y = 90; l5Diver.vx = 0.5; l5Diver.vy = 2;
        }
    }
    for (var gg = l5Glubs.length - 1; gg >= 0; gg--) {
        var gl0 = l5Glubs[gg];
        gl0.life--; gl0.y -= 0.6;
        fill(220, 255, 240, gl0.life * 5);
        textSize(11);
        text("glub", gl0.x, gl0.y);
        if (gl0.life <= 0) { l5Glubs.splice(gg, 1); }
    }
    // spinner (sits under the bar until you pick it up)
    var spinning = draggingBtn === l5Spin;
    if (!l5Done || spinning) {
        drawL5Spinner(l5Spin.x, l5Spin.y, spinning ? 22 : 6);
        if (spinning) {
            noFill(); stroke(120, 230, 255, 70); strokeWeight(2);
            ellipse(l5Spin.x, l5Spin.y, 36, 36);
            noStroke();
        }
    }
    // the pixel while you carry it (or where you dropped it)
    if (!l5Pixel.stuck || draggingBtn === l5Pixel) {
        fill(92, 88, 104);
        rect(l5Pixel.x, l5Pixel.y - 3, 6, 6);
    }
    // tips
    if (!l5Done) {
        fill(120, 130, 160);
        textSize(9);
        text(l5Tips[floor(frameCount / 300) % l5Tips.length], 200, 360);
    }
    // ---- updates ----
    if (l5Fill < 0.99) {
        l5Fill += (0.99 - l5Fill) * 0.04 + 0.001;
        if (l5Fill > 0.99) { l5Fill = 0.99; }
    } else if (!l5Cap.weak) {
        // every few seconds it tries (and fails) to finish
        if (frameCount % 240 === 0) { l5Strain = 36; }
    }
    if (l5Strain > 0) { l5Strain--; }
    // grinding the cap with the spinner
    if (spinning && !l5Cap.broken && dist(l5Spin.x, l5Spin.y, capX + 4, capY) < 18) {
        burst(capX + 4, capY + random(-8, 8), 255, 230, 140, 2, 3, 0.1);
        if (l5Cap.weak) {
            l5Cap.hp--;
            shake(1.5);
            if (l5Cap.hp <= 0) {
                l5Cap.broken = 1;
                l5Cap.flyX = capX + 4; l5Cap.flyY = capY; l5Cap.flyVX = 3.5; l5Cap.flyVY = -6;
                shake(9); flash(120, 255, 200, 70);
                burst(capX + 4, capY, 60, 230, 170, 40, 4, 0.1);
                burst(capX + 4, capY, 150, 160, 190, 16, 3, 0.15);
            }
        }
    }
};

var level5MousePressed = function() {
    if (l5Phase >= 2) { level5DivePressed(); return; }
    if (l5Enter.visible && mouseX >= 150 && mouseX <= 250 &&
        mouseY >= l5Enter.y - 18 && mouseY <= l5Enter.y + 18) {
        l5Enter.sink = 1; // glub
        return;
    }
    if (dist(mouseX, mouseY, l5Pixel.x + 3, l5Pixel.y) < 8) {
        draggingBtn = l5Pixel;
        dragOffsetX = mouseX - l5Pixel.x; dragOffsetY = mouseY - l5Pixel.y;
        return;
    }
    if (!l5Done && dist(mouseX, mouseY, l5Spin.x, l5Spin.y) < 20) {
        draggingBtn = l5Spin;
        dragOffsetX = mouseX - l5Spin.x; dragOffsetY = mouseY - l5Spin.y;
        return;
    }
    // poking the bar just makes it wobble
    if (mouseX >= L5_BX && mouseX <= L5_BX + L5_BW && mouseY >= L5_BY && mouseY <= L5_BY + L5_BH) {
        l5Strain = 20;
    }
};

var level5MouseDragged = function() {
    if (l5Phase >= 2) { level5DiveDragged(); return; }
    if (draggingBtn !== -1 && draggingBtn.x !== undefined) {
        draggingBtn.x = mouseX - dragOffsetX;
        draggingBtn.y = mouseY - dragOffsetY;
        if (draggingBtn === l5Pixel && l5Pixel.stuck &&
            dist(l5Pixel.x, l5Pixel.y, L5_BX + 2 + (L5_BW - 4) * 0.99 - 3, L5_BY + 9) > 14) {
            l5Pixel.stuck = 0;
            l5Cap.weak = 1;
            shake(4);
            burst(L5_BX + L5_BW - 6, L5_BY + 12, 80, 240, 180, 16, 2.5, 0);
        }
    }
};

var level5MouseReleased = function() {
    if (l5Phase >= 2) { level5DiveReleased(); return; }
    draggingBtn = -1;
};


// ============ LEVEL 4 - THE END (or is it?) ============
var BORDER = 30;
var l4Piece = {x: 262, y: 370, w: 50, h: 30, moved: 0};     // the slightly-off border chunk
var l4Bomb = {x: 287, y: 386, visible: 1, lit: 0, fuse: 0, exploded: 0};
var l4Blast = {x: 0, y: 0, t: 0};
var l4Safe = {x: 0, y: 0, visible: 0, open: 0, doorT: 0};
var l4Keypad = {open: 0, entry: "", msg: "", msgT: 0};
var L4_CODE = "109";
var l4Driver = {x: 0, y: 0, visible: 0};
var l4Screws = [];
var l4Plate = {x: 100, y: 150, w: 200, h: 100, off: 0, fall: 0, vy: 0, rot: 0};
var l4PressX = 0;
var l4PressY = 0;
var l4Scorch = [];
// the T and first E of "THE END" can be pried off and made into a hammer
var l4Lay = {ready: 0, offs: []};
var l4K = {x: 15, y: 132, hx: 15, hy: 132, out: 0, att: 0};
var l4Y = {x: 385, y: 262, hx: 385, hy: 262, out: 0, att: 0};
var l4Word = {formed: 0, t: 0, key: 0, got: 0};
var l4Say = {txt: "", t: 0};
var l4T = {x: 0, y: 0, moved: 0};
var l4E = {x: 0, y: 0, moved: 0, rot: 0, attached: 0};
var l4Hammer = {x: 0, y: 0, made: 0};
var l4Crack = {x: 78, y: 318, broken: 0};

var initLevel4 = function() {
    l4Piece = {x: 262, y: 370, w: 50, h: 30, moved: 0};
    l4Bomb = {x: 287, y: 386, visible: 1, lit: 0, fuse: 0, exploded: 0};
    l4Blast = {x: 0, y: 0, t: 0};
    l4Safe = {x: 0, y: 0, visible: 0, open: 0, doorT: 0};
    l4Keypad = {open: 0, entry: "", msg: "", msgT: 0};
    l4Driver = {x: 0, y: 0, visible: 0};
    l4Plate = {x: 100, y: 150, w: 200, h: 100, off: 0, fall: 0, vy: 0, rot: 0};
    l4Screws = [
        {x: 110, y: 160, p: 0, out: 0},
        {x: 290, y: 160, p: 0, out: 0},
        {x: 110, y: 240, p: 0, out: 0},
        {x: 290, y: 240, p: 0, out: 0}
    ];
    l4Scorch = [];
    l4T = {x: 0, y: 0, moved: 0};
    l4E = {x: 0, y: 0, moved: 0, rot: 0, attached: 0};
    l4Hammer = {x: 0, y: 0, made: 0};
    l4Crack = {x: 78, y: 318, broken: 0};
    l4K = {x: 15, y: 132, hx: 15, hy: 132, out: 0, att: 0};
    l4Y = {x: 385, y: 262, hx: 385, hy: 262, out: 0, att: 0};
    l4Word = {formed: 0, t: 0, key: 0, got: l4KeyGot};
    l4Say = {txt: "", t: 0};
};
initLevel4();

var l4ScrewsLeft = function() {
    var n = 0;
    for (var i = 0; i < l4Screws.length; i++) { if (!l4Screws[i].out) { n++; } }
    return n;
};

var drawL4Bomb = function() {
    if (!l4Bomb.visible) { return; }
    var bx = l4Bomb.x; var by = l4Bomb.y;
    var hot = l4Bomb.lit && (frameCount % max(3, floor(l4Bomb.fuse / 6)) < 2);
    noStroke();
    fill(0, 0, 0, 50);
    ellipse(bx + 2, by + 9, 20, 5);
    fill(hot ? 200 : 30, hot ? 30 : 30, hot ? 30 : 36);
    ellipse(bx, by, 18, 18);
    fill(255, 255, 255, 70);
    ellipse(bx - 4, by - 4, 5, 4);
    fill(80, 80, 90);
    rect(bx - 3, by - 12, 6, 4);
    // fuse
    var fuseLen = l4Bomb.lit ? 10 * (l4Bomb.fuse / 90) : 10;
    stroke(160, 130, 90); strokeWeight(1.5); noFill();
    line(bx, by - 12, bx + fuseLen * 0.4, by - 12 - fuseLen);
    noStroke();
    if (l4Bomb.lit) {
        var fx = bx + fuseLen * 0.4; var fy = by - 12 - fuseLen;
        fill(255, 220, 80, 200); ellipse(fx, fy, 7, 7);
        fill(255, 255, 220); ellipse(fx, fy, 3, 3);
        if (frameCount % 2 === 0) { burst(fx, fy, 255, 190, 60, 2, 1.8, 0.05); }
    }
};

var drawL4Safe = function() {
    if (!l4Safe.visible) { return; }
    var sx = l4Safe.x; var sy = l4Safe.y;
    noStroke();
    // blasted hole in the wall
    fill(60, 55, 50);
    ellipse(sx, sy, 96, 88);
    fill(35, 30, 28);
    ellipse(sx, sy, 84, 76);
    stroke(70, 65, 60); strokeWeight(1.5);
    for (var c = 0; c < 9; c++) {
        var ca = c * 40 + 10;
        line(sx + cos(ca) * 46, sy + sin(ca) * 42, sx + cos(ca + 8) * 64, sy + sin(ca + 8) * 58);
    }
    noStroke();
    // safe body
    fill(95, 100, 110);
    rect(sx - 30, sy - 28, 60, 56, 4);
    fill(75, 80, 90);
    rect(sx - 30, sy + 20, 60, 8, 0, 0, 4, 4);
    if (!l4Safe.open) {
        // door
        fill(120, 126, 138);
        rect(sx - 25, sy - 23, 50, 44, 3);
        fill(145, 150, 162);
        rect(sx - 25, sy - 23, 50, 4, 3, 3, 0, 0);
        // dial
        fill(60, 62, 70); ellipse(sx - 4, sy - 2, 22, 22);
        fill(190, 195, 205); ellipse(sx - 4, sy - 2, 16, 16);
        stroke(60, 62, 70); strokeWeight(1);
        for (var t = 0; t < 10; t++) {
            var ta = t * 36 + frameCount * 0;
            line(sx - 4 + cos(ta) * 6, sy - 2 + sin(ta) * 6, sx - 4 + cos(ta) * 8, sy - 2 + sin(ta) * 8);
        }
        noStroke();
        // handle
        fill(200, 170, 60);
        rect(sx + 12, sy - 8, 5, 14, 2);
        // hinges
        fill(70, 74, 82);
        rect(sx - 27, sy - 16, 3, 7);
        rect(sx - 27, sy + 6, 3, 7);
    } else {
        // inside
        fill(30, 30, 36);
        rect(sx - 25, sy - 23, 50, 44, 3);
        fill(45, 45, 52);
        rect(sx - 25, sy + 10, 50, 11);
        // door swung open (squashed to the left)
        if (l4Safe.doorT < 20) { l4Safe.doorT++; }
        var dw = 50 - l4Safe.doorT * 2.1;
        fill(120, 126, 138);
        quad(sx - 25, sy - 23, sx - 25 - dw * 0.35, sy - 29, sx - 25 - dw * 0.35, sy + 27, sx - 25, sy + 21);
        fill(60, 62, 70);
        ellipse(sx - 25 - dw * 0.2, sy - 2, 6, 14);
    }
};

var drawL4Driver = function() {
    if (!l4Driver.visible) { return; }
    // (x, y) is the tip
    var x = l4Driver.x; var y = l4Driver.y;
    stroke(170, 175, 185); strokeWeight(3);
    line(x, y, x + 16, y - 16);
    stroke(220, 225, 235); strokeWeight(1);
    line(x + 1, y - 2, x + 15, y - 16);
    noStroke();
    fill(200, 40, 40);
    quad(x + 14, y - 20, x + 20, y - 14, x + 32, y - 26, x + 26, y - 32);
    fill(240, 80, 70);
    quad(x + 16, y - 20, x + 19, y - 17, x + 29, y - 27, x + 26, y - 30);
    fill(60, 60, 60);
    rect(x - 1, y - 1, 3, 3);
};

var L4_WORD = "THE END";
var l4LayoutLetters = function() {
    if (l4Lay.ready) { return; }
    textSize(42);
    var W = textWidth(L4_WORD);
    l4Lay.offs = [];
    for (var i = 0; i < L4_WORD.length; i++) {
        l4Lay.offs.push(-W / 2 + textWidth(L4_WORD.substring(0, i)) + textWidth(L4_WORD.charAt(i)) / 2);
    }
    l4Lay.ready = 1;
};
var l4LetterHome = function(i) {
    return [l4Plate.x + l4Plate.w / 2 + l4Lay.offs[i], l4Plate.y + l4Plate.h / 2];
};
var drawL4Letter = function(ch, x, y, rot) {
    pushMatrix();
    translate(x, y);
    rotate(rot);
    fill(0);
    textAlign(CENTER);
    textSize(42);
    text(ch, 0, 15);
    popMatrix();
};
var drawL4Crack = function() {
    var cx = l4Crack.x; var cy = l4Crack.y;
    if (!l4Crack.broken) {
        // barely-there hairline cracks
        stroke(208, 208, 208); strokeWeight(1);
        line(cx - 18, cy - 4, cx - 6, cy + 1);
        line(cx - 6, cy + 1, cx + 4, cy - 3);
        line(cx + 4, cy - 3, cx + 17, cy + 3);
        line(cx - 6, cy + 1, cx - 9, cy + 9);
        line(cx + 4, cy - 3, cx + 7, cy - 11);
        noStroke();
        return;
    }
    noStroke();
    fill(70, 64, 58);
    ellipse(cx, cy, 64, 36);
    fill(40, 36, 32);
    ellipse(cx, cy + 2, 54, 28);
    fill(230, 230, 230);
    triangle(cx - 32, cy, cx - 24, cy - 12, cx - 20, cy - 2);
    triangle(cx + 30, cy - 2, cx + 22, cy - 13, cx + 18, cy - 3);
    triangle(cx - 6, cy - 18, cx + 6, cy - 18, cx, cy - 10);
    // the note inside
    pushMatrix();
    translate(cx + 1, cy + 3);
    rotate(-8);
    fill(0, 0, 0, 60); rect(-17, -9, 36, 22);
    fill(250, 245, 225); rect(-19, -11, 36, 22);
    stroke(200, 190, 160); line(-15, -4, 13, -4); noStroke();
    fill(40, 40, 120);
    textAlign(CENTER); textSize(14);
    text("109", -1, 7);
    popMatrix();
};
var drawL4Loose = function() {
    if (l4Hammer.made) {
        var hx = l4Hammer.x; var hy = l4Hammer.y;
        noStroke();
        fill(0, 0, 0, 40); ellipse(hx + 4, hy + 48, 26, 6);
        fill(150, 100, 50); rect(hx - 3, hy + 9, 6, 38, 2);    // the T, now a wooden handle
        fill(120, 80, 40); rect(hx - 3, hy + 9, 2, 38);
        pushMatrix();
        translate(hx, hy);
        rotate(90);
        textAlign(CENTER); textSize(34);
        fill(70, 74, 86);                                     // the E, now the head (drawn chunky)
        text("E", -1, 12); text("E", 1, 12); text("E", 0, 11); text("E", 0, 13);
        fill(130, 136, 150);
        text("E", 0, 12);
        popMatrix();
        return;
    }
    if (l4T.moved) { drawL4Letter("T", l4T.x, l4T.y, 0); }
    if (l4E.moved) { drawL4Letter("E", l4E.x, l4E.y, l4E.rot); }
};

var drawL4Plate = function() {
    var P = l4Plate;
    if (P.off && P.fall > 60) { return; }
    pushMatrix();
    translate(P.x + P.w / 2, P.y + P.h / 2 + P.fall * 0 + (P.off ? P.vy : 0));
    rotate(P.rot);
    noStroke();
    // same white as the wall, only a hairline seam gives it away
    fill(250, 250, 250);
    rect(-P.w / 2, -P.h / 2, P.w, P.h);
    noFill();
    stroke(228, 228, 228); strokeWeight(1);
    rect(-P.w / 2, -P.h / 2, P.w, P.h);
    noStroke();
    fill(0);
    textAlign(CENTER);
    textSize(42);
    l4LayoutLetters();
    for (var li = 0; li < L4_WORD.length; li++) {
        if (li === 0 && l4T.moved) { continue; }
        if (li === 2 && l4E.moved) { continue; }
        if (li === 4 && l4Word.formed) { continue; }
        text(L4_WORD.charAt(li), l4Lay.offs[li], 15);
    }
    popMatrix();
    // screws (only while the plate is on the wall)
    if (!P.off) {
        for (var i = 0; i < l4Screws.length; i++) {
            var s = l4Screws[i];
            if (s.out) { continue; }
            var lift = s.p / 60;
            noStroke();
            fill(0, 0, 0, 25 + lift * 40);
            ellipse(s.x + 1 + lift * 2, s.y + 1 + lift * 2, 9, 9);
            fill(225, 225, 228);
            ellipse(s.x, s.y - lift * 2, 8 + lift * 2, 8 + lift * 2);
            stroke(185, 185, 190); strokeWeight(1);
            var ra = s.p * 14 + 30;
            line(s.x - cos(ra) * 3, s.y - lift * 2 - sin(ra) * 3, s.x + cos(ra) * 3, s.y - lift * 2 + sin(ra) * 3);
            noStroke();
        }
    }
};

var drawL4Hole = function() {
    if (!l4Plate.off) { return; }
    var P = l4Plate;
    noStroke();
    fill(20, 20, 24);
    rect(P.x, P.y, P.w, P.h);
    // depth
    for (var d = 0; d < 6; d++) {
        fill(8, 8, 12, 60);
        rect(P.x + d * 6, P.y + d * 5, P.w - d * 12, P.h - d * 10);
    }
    // screw holes
    fill(40, 40, 44);
    for (var i = 0; i < l4Screws.length; i++) { ellipse(l4Screws[i].x, l4Screws[i].y, 4, 4); }
    // arrow pointing in
    if (P.fall > 40) {
        var bob = sin(frameCount * 5) * 5;
        var ax = 200; var ay = 200 + bob;
        fill(255, 255, 255, 40);
        ellipse(ax, ay, 70, 50);
        fill(255, 230, 90);
        triangle(ax + 30, ay, ax + 6, ay - 18, ax + 6, ay + 18);
        rect(ax - 28, ay - 7, 36, 14);
    }
};

var drawL4Keypad = function() {
    if (!l4Keypad.open) { return; }
    noStroke();
    fill(0, 0, 0, 150);
    rect(0, 0, 400, 400);
    fill(70, 74, 84);
    rect(110, 80, 180, 250, 8);
    fill(95, 100, 112);
    rect(110, 80, 180, 6, 8, 8, 0, 0);
    // display
    fill(20, 35, 20);
    rect(130, 95, 140, 36, 4);
    textAlign(CENTER);
    if (l4Keypad.msgT > 0) {
        l4Keypad.msgT--;
        if (l4Keypad.msg === "OPEN") { fill(120, 255, 120); } else { fill(255, 90, 90); }
        textSize(20);
        text(l4Keypad.msg, 200, 121);
    } else {
        fill(120, 255, 120);
        textSize(22);
        var shown = l4Keypad.entry;
        while (shown.length < 3) { shown += "_"; }
        text(shown.split("").join(" "), 200, 122);
    }
    // buttons
    var labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"];
    for (var i = 0; i < 12; i++) {
        var bx = 128 + (i % 3) * 50; var by = 145 + floor(i / 3) * 44;
        var hover = mouseX >= bx && mouseX <= bx + 44 && mouseY >= by && mouseY <= by + 36;
        fill(hover ? 150 : 125, hover ? 155 : 130, hover ? 170 : 145);
        rect(bx, by, 44, 36, 5);
        fill(35, 35, 40);
        textSize(labels[i].length > 1 ? 12 : 16);
        text(labels[i], bx + 22, by + 24);
    }
    fill(210, 210, 220);
    textSize(9);
    text("click outside to close", 200, 322);
};

// ---------- the hidden K and Y in the wall -> K E Y -> a real key ----------
// a chunky black block letter with a bevel (like the sign's letters, but loose)
var drawL4Block = function(ch, x, y, s) {
    textAlign(CENTER); textSize(42 * s);
    var by = y + 15 * s;
    // soft shadow + a chunky 3D side (stacked layers)
    fill(0, 0, 0, 40); text(ch, x + 4, by + 5);
    for (var d = 4; d > 0; d--) { fill(40 + d * 6, 40 + d * 6, 46 + d * 6); text(ch, x + d * 0.8, by + d * 0.8); }
    fill(0); text(ch, x, by);
    // shine on the top-left edge
    fill(255, 255, 255, 70); text(ch, x - 1, by - 1.5);
    fill(20, 20, 24); text(ch, x, by);
    // little chips from being pried out of the wall
    noStroke(); fill(255, 255, 255, 120);
    rect(x - 12 * s, y - 10 * s, 3 * s, 2 * s); rect(x + 8 * s, y + 6 * s, 2 * s, 2 * s);
};
// a letter carved into the white wall (very faint)
var drawL4Carved = function(ch, x, y) {
    // carved into the BLACK border (you have to look closely)
    textAlign(CENTER); textSize(26);
    noFill(); stroke(26, 26, 28); strokeWeight(1);
    rect(x - 12, y - 14, 24, 28, 3);
    stroke(34, 34, 36); line(x - 12, y + 14, x - 15, y + 20); line(x + 12, y - 14, x + 15, y - 19);
    noStroke();
    fill(30, 30, 33); text(ch, x + 1, y + 10);
    fill(14, 14, 16); text(ch, x, y + 9);
    fill(44, 44, 48); text(ch, x - 0.7, y + 8.3);
    fill(24, 24, 26); ellipse(x - 5, y + 18, 2, 2); ellipse(x + 4, y + 19, 2, 1.5);
    var gl = (frameCount + x * 3) % 260;
    if (gl < 20) {
        var ga = sin(gl * 9) * 160;
        stroke(255, 240, 180, ga); strokeWeight(1);
        line(x + 7, y - 10, x + 7, y - 4); line(x + 4, y - 7, x + 10, y - 7); noStroke();
    }
};// the letter-shaped hole left behind
var drawL4Socket = function(ch, x, y) {
    // the hole it left in the border
    textAlign(CENTER); textSize(26);
    fill(8, 8, 8); rect(x - 12, y - 14, 24, 28, 3);
    fill(40, 40, 44); text(ch, x, y + 9);
    fill(30, 30, 32); triangle(x - 12, y - 14, x - 6, y - 14, x - 12, y - 8);
};var drawL4BigKey = function(x, y, s) {
    pushMatrix(); translate(x, y); scale(s);
    noStroke();
    // glow + sparkles
    fill(255, 220, 100, 40 + sin(frameCount * 5) * 20); ellipse(0, 0, 150, 84);
    fill(255, 230, 140, 50 + sin(frameCount * 5) * 25); ellipse(0, 0, 112, 56);
    for (var sp = 0; sp < 5; sp++) {
        var sa = frameCount * 2 + sp * 72;
        var sx = cos(sa) * 62; var sy = sin(sa) * 30; var sz = 3 + sin(frameCount * 10 + sp * 50) * 2;
        fill(255, 250, 210); rect(sx - sz / 2, sy - 0.5, sz, 1); rect(sx - 0.5, sy - sz / 2, 1, sz);
    }
    // shadow
    fill(0, 0, 0, 40); ellipse(6, 30, 100, 10);
    // the bow: a fancy brass ring
    fill(150, 100, 30); ellipse(-34, 0, 46, 46);
    fill(220, 170, 60); ellipse(-34, -1, 42, 42);
    fill(250, 210, 100); ellipse(-36, -3, 34, 34);
    fill(120, 80, 20); ellipse(-34, 0, 22, 22);
    fill(255, 245, 220); ellipse(-34, 0, 18, 18);
    // little studs around the bow
    fill(255, 240, 170);
    for (var b = 0; b < 8; b++) { ellipse(-34 + cos(b * 45) * 19, sin(b * 45) * 19, 3.5, 3.5); }
    fill(60, 40, 10); textSize(8); textAlign(CENTER); text("KEY", -34, 3);
    // collar
    fill(180, 130, 40); rect(-14, -8, 8, 16, 2); rect(-4, -7, 4, 14, 1);
    // shaft
    fill(200, 150, 50); rect(0, -5, 48, 10, 2);
    fill(240, 200, 100); rect(0, -5, 48, 3, 2);
    // teeth shaped like a K, an E and a Y
    fill(200, 150, 50);
    rect(22, 5, 4, 12); triangle(26, 9, 32, 5, 32, 9); triangle(26, 11, 32, 17, 32, 13);
    rect(34, 5, 3, 12); rect(37, 5, 4, 2); rect(37, 10, 3, 2); rect(37, 15, 4, 2);
    triangle(43, 5, 47, 5, 46, 11); triangle(48, 5, 52, 5, 47, 11); rect(46, 10, 2, 7);
    fill(255, 255, 255, 110); rect(4, -4, 40, 1.5);
    popMatrix();
};
var drawL4KeyWord = function() {
    if (l4Word.got) { return; }
    noStroke();
    var eh = l4Plate.off ? null : [l4Plate.x + l4Plate.w / 2 + l4Lay.offs[4], l4Plate.y + l4Plate.h / 2];
    // in the wall (or the holes they left)
    if (!l4K.out) { drawL4Carved("K", l4K.hx, l4K.hy); } else { drawL4Socket("K", l4K.hx, l4K.hy); }
    if (!l4Y.out) { drawL4Carved("Y", l4Y.hx, l4Y.hy); } else { drawL4Socket("Y", l4Y.hx, l4Y.hy); }
    if (!l4Word.formed) {
        // stuck onto the E (they float just above it, waiting for the other one)
        if (eh && l4K.att) { l4K.x = eh[0] - 22; l4K.y = eh[1] - 46 + sin(frameCount * 4) * 2; }
        if (eh && l4Y.att) { l4Y.x = eh[0] + 22; l4Y.y = eh[1] - 46 + sin(frameCount * 4 + 90) * 2; }
        if (l4K.out) { drawL4Block("K", l4K.x, l4K.y, 0.8); }
        if (l4Y.out) { drawL4Block("Y", l4Y.x, l4Y.y, 0.8); }
        if (eh && (l4K.att || l4Y.att)) {
            stroke(255, 200, 60, 120 + sin(frameCount * 8) * 80); strokeWeight(1.5);
            if (l4K.att) { line(eh[0] - 10, eh[1] - 22, l4K.x + 6, l4K.y + 10); }
            if (l4Y.att) { line(eh[0] + 10, eh[1] - 22, l4Y.x - 6, l4Y.y + 10); }
            noStroke();
        }
        if (eh && l4K.att && l4Y.att) {
            l4Word.formed = 1; l4Word.t = 0;
            shake(4); flash(255, 230, 140, 90);
            burst(eh[0], eh[1], 255, 220, 100, 26, 3, 0);
            l4Say = {txt: "K - E - Y ...the letters snap together!", t: 150};
        }
    } else if (!l4Word.key) {
        // the word KEY floats up out of the sign
        l4Word.t++;
        var k = min(1, l4Word.t / 50);
        var wx = 200; var wy = 250 - 130 * k;
        fill(255, 220, 100, 50 + sin(frameCount * 6) * 30); ellipse(wx, wy, 150, 60);
        drawL4Block("K", wx - 30, wy, 0.9); drawL4Block("E", wx, wy, 0.9); drawL4Block("Y", wx + 30, wy, 0.9);
        if (frameCount % 8 === 0) { burst(wx + random(-40, 40), wy + random(-14, 14), 255, 230, 120, 1, 1, -0.02); }
    } else {
        // it's a real key now
        l4Word.t++;
        drawL4BigKey(200, 120 + sin(frameCount * 3) * 4, 1);
    }
    if (l4Say.t > 0) {
        l4Say.t--;
        fill(0, 0, 0, min(170, l4Say.t * 6)); textSize(12); textAlign(CENTER);
        var tw = textWidth(l4Say.txt) + 16;
        rect(200 - tw / 2, 50, tw, 20, 5);
        fill(255, 255, 255, min(255, l4Say.t * 8)); text(l4Say.txt, 200, 64);
    }
};
// clicks for the K / Y / KEY (returns true if it used the click)
var l4KeyPressed = function() {
    if (l4Word.got) { return false; }
    if (l4Word.formed && !l4Word.key && l4Word.t > 50 && abs(mouseX - 200) < 60 && abs(mouseY - 120) < 26) {
        l4Word.key = 1; l4Word.t = 0;
        shake(5); flash(255, 240, 180, 120);
        burst(200, 120, 255, 220, 100, 30, 3.5, 0.02);
        l4Say = {txt: "*CLINK* the word turned into a real KEY!", t: 150};
        return true;
    }
    if (l4Word.key && dist(mouseX, mouseY, 200, 120) < 50) {
        l4Word.got = 1; l4KeyGot = 1;
        burst(200, 120, 255, 220, 100, 24, 3, 0.05);
        l4Say = {txt: "you got the KEY. (it's for a door... somewhere later.)", t: 200};
        return true;
    }
    if (!l4K.out && dist(mouseX, mouseY, l4K.hx, l4K.hy) < 20) {
        l4K.out = 1; l4K.x = l4K.hx; l4K.y = l4K.hy;
        burst(l4K.hx, l4K.hy, 235, 235, 235, 14, 2, 0.12); shake(2);
        draggingBtn = l4K; dragOffsetX = mouseX - l4K.x; dragOffsetY = mouseY - l4K.y;
        return true;
    }
    if (!l4Y.out && dist(mouseX, mouseY, l4Y.hx, l4Y.hy) < 20) {
        l4Y.out = 1; l4Y.x = l4Y.hx; l4Y.y = l4Y.hy;
        burst(l4Y.hx, l4Y.hy, 235, 235, 235, 14, 2, 0.12); shake(2);
        draggingBtn = l4Y; dragOffsetX = mouseX - l4Y.x; dragOffsetY = mouseY - l4Y.y;
        return true;
    }
    if (l4K.out && !l4K.att && dist(mouseX, mouseY, l4K.x, l4K.y) < 20) {
        draggingBtn = l4K; dragOffsetX = mouseX - l4K.x; dragOffsetY = mouseY - l4K.y; return true;
    }
    if (l4Y.out && !l4Y.att && dist(mouseX, mouseY, l4Y.x, l4Y.y) < 20) {
        draggingBtn = l4Y; dragOffsetX = mouseX - l4Y.x; dragOffsetY = mouseY - l4Y.y; return true;
    }
    return false;
};
var l4KeyReleased = function() {
    if (draggingBtn !== l4K && draggingBtn !== l4Y) { return false; }
    var L = draggingBtn;
    draggingBtn = -1;
    l4LayoutLetters();
    if (!l4Plate.off) {
        var ex = l4Plate.x + l4Plate.w / 2 + l4Lay.offs[4]; var ey = l4Plate.y + l4Plate.h / 2;
        if (dist(L.x, L.y, ex, ey) < 42) {
            L.att = 1;
            burst(ex, ey - 30, 255, 220, 100, 10, 2, 0);
            l4Say = {txt: (L === l4K ? "the K" : "the Y") + " sticks to the E in END...", t: 120};
        }
    }
    return true;
};
var drawLevel4 = function() {
    background(250, 250, 250);
    // scorch marks from the blast
    noStroke();
    for (var s = 0; s < l4Scorch.length; s++) {
        var sc = l4Scorch[s];
        fill(40, 35, 30, sc.a);
        ellipse(sc.x, sc.y, sc.r, sc.r * 0.8);
    }
    drawL4Hole();
    drawL4Crack();
    drawL4Plate();
    drawL4Loose();
    drawL4Safe();
    // black border
    noStroke();
    fill(0);
    rect(0, 0, 400, BORDER);
    rect(0, 400 - BORDER, 400, BORDER);
    rect(0, 0, BORDER, 400);
    rect(400 - BORDER, 0, BORDER, 400);
    // the gap where the odd piece was
    if (l4Piece.moved) {
        fill(55, 48, 42);
        rect(262, 370, 50, 30);
        fill(35, 30, 26);
        rect(265, 373, 44, 27);
    }
    // bomb sits in the gap until you take it
    drawL4Bomb();
    // the odd piece (a tiny bit browner than the rest of the border)
    fill(20, 16, 13);
    rect(l4Piece.x, l4Piece.y, l4Piece.w, l4Piece.h);
    if (l4Piece.moved) {
        fill(28, 23, 19);
        rect(l4Piece.x, l4Piece.y, l4Piece.w, 2);
    }
    drawL4Driver();
    // blast
    if (l4Blast.t > 0) {
        var k = l4Blast.t / 40;
        noStroke();
        fill(255, 240, 180, 255 * k);
        ellipse(l4Blast.x, l4Blast.y, (1 - k) * 180 + 20, (1 - k) * 180 + 20);
        fill(255, 150, 40, 200 * k);
        ellipse(l4Blast.x, l4Blast.y, (1 - k) * 120 + 10, (1 - k) * 120 + 10);
        noFill(); stroke(80, 70, 60, 200 * k); strokeWeight(4);
        ellipse(l4Blast.x, l4Blast.y, (1 - k) * 260, (1 - k) * 260);
        noStroke(); strokeWeight(1);
        l4Blast.t--;
    }
    drawL4Keypad();
    // ---- updates ----
    if (l4Bomb.lit && !l4Bomb.exploded) {
        l4Bomb.fuse--;
        if (l4Bomb.fuse <= 0) {
            l4Bomb.exploded = 1; l4Bomb.visible = 0;
            l4Blast.x = l4Bomb.x; l4Blast.y = l4Bomb.y; l4Blast.t = 40;
            shake(16); flash(255, 245, 210, 200);
            burst(l4Bomb.x, l4Bomb.y, 255, 170, 40, 60, 6, 0.1);
            burst(l4Bomb.x, l4Bomb.y, 90, 85, 80, 40, 3, -0.03);
            burst(l4Bomb.x, l4Bomb.y, 240, 240, 240, 30, 5, 0.2);
            for (var sc2 = 0; sc2 < 10; sc2++) {
                l4Scorch.push({x: l4Bomb.x + random(-45, 45), y: l4Bomb.y + random(-40, 40), r: random(20, 50), a: floor(random(20, 60))});
            }
            // the blast opens the wall and there's a safe in it
            var sx = constrain(l4Bomb.x, BORDER + 50, 400 - BORDER - 50);
            var sy = constrain(l4Bomb.y, BORDER + 46, 400 - BORDER - 46);
            if (abs(sx - 200) < 100 + 48 && abs(sy - 200) < 50 + 44) {
                sy = sy < 200 ? 150 - 46 : 250 + 46;
            }
            if (dist(sx, sy, l4Crack.x, l4Crack.y) < 95) { sx = 290; }
            l4Safe.x = sx; l4Safe.y = sy; l4Safe.visible = 1;
        }
    }
    // unscrewing: hold the screwdriver tip on a screw
    if (draggingBtn === l4Driver && !l4Plate.off) {
        for (var i = 0; i < l4Screws.length; i++) {
            var sw = l4Screws[i];
            if (!sw.out && dist(l4Driver.x, l4Driver.y, sw.x, sw.y) < 9) {
                sw.p++;
                if (frameCount % 5 === 0) { burst(sw.x, sw.y, 200, 200, 205, 1, 1, 0.1); }
                if (sw.p >= 60) {
                    sw.out = 1;
                    burst(sw.x, sw.y, 210, 210, 215, 12, 2.5, 0.15);
                    shake(2);
                    if (l4ScrewsLeft() === 0) { l4Plate.off = 1; l4Plate.vy = 0; l4Plate.fall = 0; }
                }
            }
        }
    }
    // plate falls away once all four screws are out
    if (l4Plate.off && l4Plate.fall <= 60) {
        l4Plate.fall++;
        if (l4Plate.fall > 12) {
            l4Plate.vy += (l4Plate.fall - 12) * 0.35;
            l4Plate.rot += 1.5;
        } else {
            l4Plate.rot = sin(l4Plate.fall * 40) * 2;
        }
        if (l4Plate.fall === 30) { shake(8); burst(200, 360, 230, 230, 230, 20, 3, 0.1); }
    }
    if (!l4Keypad.open) { l4LayoutLetters(); drawL4KeyWord(); }
};

var level4MousePressed = function() {
    // keypad first
    if (!l4Keypad.open && l4KeyPressed()) { return; }
    if (l4Keypad.open) {
        if (mouseX < 110 || mouseX > 290 || mouseY < 80 || mouseY > 330) { l4Keypad.open = 0; return; }
        var labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"];
        for (var i = 0; i < 12; i++) {
            var bx = 128 + (i % 3) * 50; var by = 145 + floor(i / 3) * 44;
            if (mouseX >= bx && mouseX <= bx + 44 && mouseY >= by && mouseY <= by + 36) {
                var L = labels[i];
                l4Keypad.msgT = 0;
                if (L === "C") { l4Keypad.entry = ""; }
                else if (L === "OK") {
                    if (l4Keypad.entry === L4_CODE) {
                        l4Keypad.msg = "OPEN"; l4Keypad.msgT = 40;
                        l4Safe.open = 1; l4Safe.doorT = 0;
                        l4Driver.visible = 1; l4Driver.x = l4Safe.x - 10; l4Driver.y = l4Safe.y + 8;
                        l4Keypad.open = 0;
                        flash(120, 255, 120, 60);
                        burst(l4Safe.x, l4Safe.y, 255, 240, 150, 24, 3, 0.05);
                    } else {
                        l4Keypad.msg = "WRONG"; l4Keypad.msgT = 45;
                        l4Keypad.entry = "";
                        shake(4);
                    }
                } else if (l4Keypad.entry.length < 3) {
                    l4Keypad.entry += L;
                }
                return;
            }
        }
        return;
    }
    // hole with the arrow -> level 5
    if (l4Plate.off && l4Plate.fall > 40 &&
        mouseX >= l4Plate.x && mouseX <= l4Plate.x + l4Plate.w &&
        mouseY >= l4Plate.y && mouseY <= l4Plate.y + l4Plate.h) {
        level = 5;
        initLevel5();
        return;
    }
    // screwdriver
    if (l4Driver.visible && dist(mouseX, mouseY, l4Driver.x + 14, l4Driver.y - 14) < 22) {
        draggingBtn = l4Driver;
        dragOffsetX = mouseX - l4Driver.x; dragOffsetY = mouseY - l4Driver.y;
        return;
    }
    // bomb (drag it, or click it without moving to light it)
    if (l4Bomb.visible && !l4Bomb.lit && l4Piece.moved && dist(mouseX, mouseY, l4Bomb.x, l4Bomb.y) < 13) {
        draggingBtn = l4Bomb;
        dragOffsetX = mouseX - l4Bomb.x; dragOffsetY = mouseY - l4Bomb.y;
        l4PressX = mouseX; l4PressY = mouseY;
        return;
    }
    // the odd border piece
    if (mouseX >= l4Piece.x && mouseX <= l4Piece.x + l4Piece.w &&
        mouseY >= l4Piece.y && mouseY <= l4Piece.y + l4Piece.h) {
        draggingBtn = l4Piece;
        dragOffsetX = mouseX - l4Piece.x; dragOffsetY = mouseY - l4Piece.y;
        return;
    }
    // closed safe -> keypad
    if (l4Safe.visible && !l4Safe.open && abs(mouseX - l4Safe.x) < 30 && abs(mouseY - l4Safe.y) < 28) {
        l4Keypad.open = 1; l4Keypad.entry = ""; l4Keypad.msgT = 0;
        return;
    }
    l4PressX = mouseX; l4PressY = mouseY;
    // the hammer
    if (l4Hammer.made) {
        if (abs(mouseX - l4Hammer.x) < 20 && mouseY > l4Hammer.y - 16 && mouseY < l4Hammer.y + 46) {
            draggingBtn = l4Hammer;
            dragOffsetX = mouseX - l4Hammer.x; dragOffsetY = mouseY - l4Hammer.y;
        }
        return;
    }
    // letters (pry them off the plate, or pick up loose ones)
    l4LayoutLetters();
    if (l4E.moved && dist(mouseX, mouseY, l4E.x, l4E.y) < 17) {
        draggingBtn = l4E; dragOffsetX = mouseX - l4E.x; dragOffsetY = mouseY - l4E.y;
        return;
    }
    if (l4T.moved && dist(mouseX, mouseY, l4T.x, l4T.y) < 17) {
        draggingBtn = l4T; dragOffsetX = mouseX - l4T.x; dragOffsetY = mouseY - l4T.y;
        return;
    }
    if (!l4Plate.off) {
        var eh = l4LetterHome(2); var th = l4LetterHome(0);
        if (!l4E.moved && dist(mouseX, mouseY, eh[0], eh[1]) < 17) {
            l4E.moved = 1; l4E.x = eh[0]; l4E.y = eh[1];
            draggingBtn = l4E; dragOffsetX = mouseX - l4E.x; dragOffsetY = mouseY - l4E.y;
            return;
        }
        if (!l4T.moved && dist(mouseX, mouseY, th[0], th[1]) < 17) {
            l4T.moved = 1; l4T.x = th[0]; l4T.y = th[1];
            draggingBtn = l4T; dragOffsetX = mouseX - l4T.x; dragOffsetY = mouseY - l4T.y;
            return;
        }
    }
};

var level4MouseDragged = function() {
    if (draggingBtn !== -1 && draggingBtn.x !== undefined) {
        draggingBtn.x = mouseX - dragOffsetX;
        draggingBtn.y = mouseY - dragOffsetY;
        if (l4E.attached && draggingBtn === l4T) { l4E.x = l4T.x; l4E.y = l4T.y - 26; }
        if (l4E.attached && draggingBtn === l4E) { l4T.x = l4E.x; l4T.y = l4E.y + 26; }
        if (draggingBtn === l4Piece && !l4Piece.moved &&
            (abs(l4Piece.x - 262) > 6 || abs(l4Piece.y - 370) > 6)) {
            l4Piece.moved = 1;
            burst(287, 385, 60, 50, 45, 10, 1.5, 0.1);
        }
    }
};

var level4MouseReleased = function() {
    if (l4KeyReleased()) { return; }
    var clicked = dist(mouseX, mouseY, l4PressX, l4PressY) < 4;
    // E dropped on top of the T (on the plate or loose): they stick together
    l4LayoutLetters();
    var tPos = l4T.moved ? [l4T.x, l4T.y] : l4LetterHome(0);
    if ((draggingBtn === l4E || draggingBtn === l4T) && !l4E.attached && l4E.moved &&
        (l4T.moved || !l4Plate.off) && dist(l4E.x, l4E.y, tPos[0], tPos[1] - 26) < 24) {
        if (!l4T.moved) { l4T.moved = 1; l4T.x = tPos[0]; l4T.y = tPos[1]; }
        l4E.attached = 1;
        l4E.x = l4T.x; l4E.y = l4T.y - 26;
        burst(l4T.x, l4T.y - 14, 120, 120, 120, 8, 1.5, 0.05);
    } else if (draggingBtn === l4E && l4E.attached && clicked) {
        // click the E to turn it
        l4E.rot = (l4E.rot + 90) % 360;
        if (l4E.rot === 90) {
            // prongs down: it's a hammer now
            l4Hammer.made = 1; l4Hammer.x = l4T.x; l4Hammer.y = l4T.y - 20;
            burst(l4Hammer.x, l4Hammer.y + 10, 255, 230, 140, 24, 3, 0.05);
            flash(255, 255, 220, 60);
        }
    }
    // hammer on the cracked bit of floor
    if (draggingBtn === l4Hammer && !l4Crack.broken && dist(l4Hammer.x, l4Hammer.y, l4Crack.x, l4Crack.y) < 34) {
        l4Crack.broken = 1;
        shake(9);
        burst(l4Crack.x, l4Crack.y, 160, 150, 140, 30, 3.5, 0.15);
        burst(l4Crack.x, l4Crack.y, 240, 240, 240, 16, 3, 0.15);
        l4Hammer.x = l4Crack.x + 50; l4Hammer.y = l4Crack.y - 30;
    }
    if (draggingBtn === l4Bomb) {
        if (dist(mouseX, mouseY, l4PressX, l4PressY) < 4) {
            // a click, not a drag: light it!
            l4Bomb.lit = 1; l4Bomb.fuse = 90;
        }
    }
    draggingBtn = -1;
};


// LEVEL 2 - The Forest
var forestStage = 0;
var groundLeaves = [];
var wormLeaf = -1;
var rockLeaf = -1;
var worm = {x:0, y:0, visible:0, dragging:0};
var rock = {x:0, y:0, visible:0, dragging:0};
var bird = {x:120, y:80, vx:0, vy:0, state:0, dead:0, deadTimer:0};
var nestX = 100;
var nestY = 100;
var EGG_DY = 79; // eggs are drawn this far below their stored y
var nestLeafsVisible = 1;
var nestRevealed = 0;
var eggs = [];
var hatchedBirds = [];
var birdFlapTimer = 0;
var fox = {x:-50, y:305, vx:1.2, visible:0, dead:0, clicks:0, corpse:0};
var foxTimer = 0;
var monsters = [];
var monsterFedCounts = [0,0,0];
var angryMonster = -1;
var angryTimer = 0;
var eatingTimer = 0;
var corpseEaten = 0;
var forestFoods = [];
var forestFoodLeaves = [];
var foodTypes = ["berry", "mushroom", "grub", "berry", "mushroom", "grub", "berry", "grub"];
var treeX = 110;
var treeY = 200;
var corpse = {x:0, y:0, visible:0};
var returnToL1Button = 0;
var playerMonster = {visible:0, x:200, y:60, size:1.4, r:150, g:20, b:200, angle:0, speed:0.015, radius:30, cx:200, cy:60, fedCount:0};
var l1FoodIndex = 0;
var l1NewFoodTypes = ["beetle", "centipede", "spider", "firefly", "moth", "witcheye", "batwing", "snakeegg", "mystery"];
var l1CurrentFood = {x:200, y:320, type:"beetle", visible:0, width:18, height:14};
var monsterAteWolf = 0;
var monsterAteTimer = 0;
// tree smash / level 3 vars
var goToForestButton = 0;
var treeSmashing = 0;
var treeSmashTimer = 0;
var treeFallAngle = 0;
var treeFallen = 0;
var magicDoorVisible = 0;
var level3Screen = 0;
var monsterZoomingToTree = 0;
var monsterZoomX = 0;
var monsterZoomY = 0;

// forest scenery data
var forestCanopies = [[50,250,80,154],[181,250,80,100],[237,250,80,163],[289,250,80,100],[145,250,80,131],[8,250,80,133],[116,250,80,85],[320,240,90,110],[390,260,70,169]];
var forestTrunks = [[42,250,16,60],[175,250,16,60],[229,250,16,60],[-3,250,16,60],[107,250,16,60],[138,250,16,60],[312,250,18,60],[273,250,18,60],[382,260,14,50]];
var forestClouds = [{x:60, y:60, s:1}, {x:230, y:38, s:0.8}, {x:380, y:88, s:1.2}];
var forestGrass = [];
for (var fgi = 0; fgi < 170; fgi++) {
    forestGrass.push({x: random(0, 400), h: random(4, 12), g: floor(random(120, 175))});
}
var forestFlowers = [];
for (var ffi = 0; ffi < 14; ffi++) {
    var fcPick = floor(random(0, 3));
    forestFlowers.push({
        x: random(10, 390), y: random(300, 306),
        r: fcPick === 0 ? 255 : (fcPick === 1 ? 250 : 200),
        g: fcPick === 0 ? 240 : (fcPick === 1 ? 140 : 160),
        b: fcPick === 0 ? 120 : (fcPick === 1 ? 180 : 255)
    });
}
var forestMotes = [];
for (var fmi = 0; fmi < 26; fmi++) {
    forestMotes.push({x: random(0, 400), y: random(80, 300), vx: random(-0.2, 0.2), vy: random(-0.35, -0.1), p: random(0, 360)});
}

// LEVEL 3 - Dark Crystal Cave
var caveRoom = 0;
var cavePot = {x:180, y:300, visible:1, width:30, height:30};
var cavePotContents = [];
var altarX = 200;
var altarY = 260;
var altarVisible = 0;
var altarActivated = 0;
var bossAlive = 0;
var bossHP = 240;
var bossMaxHP = 240;
var bossX = 200;
var bossY = 160;
var bossShakeX = 0;
var bossDead = 0;
var bossDeathTimer = 0;
var l3Portal = 0;
var caveFighters = [];
var l3CritterTypes = ["eyeball","waxcandle","shadow","mouth","jar","bonespider","rockface"];
var caveCritters = [];
var initCaveCritters = function() {
    caveCritters = [];
    caveCritters.push({type:"eyeball",   x:80,  y:270, room:0, caught:0, catchType:"roam", vx:1.2, rockRemoved:0, cageOpen:0, emerged:0, emergeTimer:0, inPot:0});
    caveCritters.push({type:"eyeball",   x:300, y:250, room:0, caught:0, catchType:"roam", vx:-1,  rockRemoved:0, cageOpen:0, emerged:0, emergeTimer:0, inPot:0});
    caveCritters.push({type:"waxcandle", x:120, y:308, room:0, caught:0, catchType:"rock", rockX:110, rockY:300, vx:0, rockRemoved:0, cageOpen:0, emerged:0, emergeTimer:0, inPot:0});
    caveCritters.push({type:"shadow",    x:350, y:200, room:0, caught:0, catchType:"crack", crackX:355, crackY:175, vx:0, rockRemoved:0, cageOpen:0, emerged:0, emergeTimer:0, inPot:0});
    caveCritters.push({type:"waxcandle", x:100, y:248, room:1, caught:0, catchType:"cage", cageX:82, cageY:228, vx:0, rockRemoved:0, cageOpen:0, emerged:1, emergeTimer:0, inPot:0});
    caveCritters.push({type:"mouth",     x:150, y:288, room:1, caught:0, catchType:"roam", vx:1.5, rockRemoved:0, cageOpen:0, emerged:0, emergeTimer:0, inPot:0});
    caveCritters.push({type:"mouth",     x:280, y:268, room:1, caught:0, catchType:"roam", vx:-1.2, rockRemoved:0, cageOpen:0, emerged:0, emergeTimer:0, inPot:0});
    caveCritters.push({type:"bonespider",x:320, y:298, room:1, caught:0, catchType:"crack", crackX:328, crackY:275, vx:0, rockRemoved:0, cageOpen:0, emerged:0, emergeTimer:0, inPot:0});
    caveCritters.push({type:"jar",       x:160, y:303, room:2, caught:0, catchType:"rock", rockX:148, rockY:296, vx:0, rockRemoved:0, cageOpen:0, emerged:0, emergeTimer:0, inPot:0});
    caveCritters.push({type:"jar",       x:260, y:308, room:2, caught:0, catchType:"rock", rockX:248, rockY:301, vx:0, rockRemoved:0, cageOpen:0, emerged:0, emergeTimer:0, inPot:0});
    caveCritters.push({type:"shadow",    x:310, y:238, room:2, caught:0, catchType:"roam", vx:-1, rockRemoved:0, cageOpen:0, emerged:0, emergeTimer:0, inPot:0});
    caveCritters.push({type:"rockface",  x:80,  y:258, room:2, caught:0, catchType:"cage", cageX:62, cageY:238, vx:0, rockRemoved:0, cageOpen:0, emerged:1, emergeTimer:0, inPot:0});
    caveCritters.push({type:"bonespider",x:60,  y:288, room:3, caught:0, catchType:"crack", crackX:48, crackY:268, vx:0, rockRemoved:0, cageOpen:0, emerged:0, emergeTimer:0, inPot:0});
    caveCritters.push({type:"rockface",  x:310, y:298, room:3, caught:0, catchType:"rock", rockX:298, rockY:291, vx:0, rockRemoved:0, cageOpen:0, emerged:0, emergeTimer:0, inPot:0});
};
initCaveCritters();
var caveRoomColors = [
    [{r:255,g:50,b:200},{r:50,g:255,b:200},{r:255,g:200,b:50}],
    [{r:100,g:50,b:255},{r:50,g:200,b:255},{r:200,g:50,b:255}],
    [{r:255,g:100,b:50},{r:50,g:255,b:100},{r:100,g:200,b:255}],
    [{r:180,g:0,b:255},{r:255,g:0,b:100},{r:0,g:255,b:180}]
];

// cave scenery data
var caveSpecks = [];
for (var csi = 0; csi < 90; csi++) {
    caveSpecks.push({x: random(0, 400), y: random(70, 310), s: random(2, 7), a: floor(random(20, 60))});
}
var caveDrips = [];
var dripCols = [1, 4, 6, 9, 11];
for (var cdi = 0; cdi < dripCols.length; cdi++) {
    var dci = dripCols[cdi];
    caveDrips.push({x: 20 + dci * 33, top: 30 + floor(sin(dci * 1.3) * 20), y: 0, v: 0, wait: floor(random(0, 200))});
}
var caveMotes = [];
for (var cmi = 0; cmi < 30; cmi++) {
    caveMotes.push({x: random(0, 400), y: random(60, 320), vx: random(-0.25, 0.25), vy: random(-0.2, 0.2), p: random(0, 360)});
}
var caveFungi = [[40, 311], [95, 313], [205, 312], [290, 310], [365, 313]];

var initGroundLeaves = function() {
    groundLeaves = [];
    for (var i = 0; i < 60; i++) {
        groundLeaves.push({
            x: floor(random(5, 370)),
            y: floor(random(310, 355)),
            w: floor(random(22, 40)),
            h: floor(random(12, 22)),
            rot: random(-30, 30),
            r: floor(random(120, 180)),
            g: floor(random(80, 140)),
            b: floor(random(10, 40)),
            removed: 0
        });
    }
    wormLeaf = floor(random(5, 15));
    rockLeaf = floor(random(16, 28));
    forestFoodLeaves = [];
    var used = {};
    used[wormLeaf] = 1;
    used[rockLeaf] = 1;
    for (var f = 0; f < 8; f++) {
        var idx;
        do { idx = floor(random(0, 60)); } while (used[idx]);
        forestFoodLeaves.push(idx);
        used[idx] = 1;
    }
    worm.x = groundLeaves[wormLeaf].x + 10;
    worm.y = groundLeaves[wormLeaf].y;
    rock.x = groundLeaves[rockLeaf].x + 8;
    rock.y = groundLeaves[rockLeaf].y;
    forestFoods = [];
    for (var fi = 0; fi < 8; fi++) {
        var lf = groundLeaves[forestFoodLeaves[fi]];
        forestFoods.push({
            x: lf.x + 8, y: lf.y,
            type: foodTypes[fi],
            visible: 0, dragging: 0
        });
    }
};
initGroundLeaves();

var initEggs = function() {
    eggs = [];
    for (var i = 0; i < 4; i++) {
        eggs.push({
            x: nestX - 16 + i * 12,
            y: nestY + 8,
            clicks: 0,
            hatched: 0,
            cracked: 0
        });
    }
};
initEggs();

var drawForestBackground = function() {
    noStroke();
    // gradient sky
    for (var gy = 0; gy < 300; gy += 6) {
        var k = gy / 300;
        fill(110 + 60 * k, 175 + 45 * k, 235 - 10 * k);
        rect(0, gy, 400, 6);
    }
    // sun + rays
    stroke(255, 235, 120, 90); strokeWeight(2);
    for (var ra = 0; ra < 360; ra += 24) {
        var aa = ra + frameCount * 0.4;
        line(360 + cos(aa) * 32, 50 + sin(aa) * 32, 360 + cos(aa) * 44, 50 + sin(aa) * 44);
    }
    noStroke();
    fill(255, 240, 100, 40);
    ellipse(360, 50, 95, 95);
    fill(255, 240, 100, 80);
    ellipse(360, 50, 70, 70);
    fill(255, 230, 50);
    ellipse(360, 50, 50, 50);
    fill(255, 250, 170);
    ellipse(354, 44, 24, 24);
    // drifting clouds
    for (var ci = 0; ci < forestClouds.length; ci++) {
        var c = forestClouds[ci];
        c.x += 0.15 * c.s;
        if (c.x > 470) { c.x = -70; }
        var s = c.s;
        fill(215, 230, 245);
        ellipse(c.x, c.y + 6 * s, 80 * s, 22 * s);
        fill(250, 252, 255);
        ellipse(c.x - 18 * s, c.y, 36 * s, 26 * s);
        ellipse(c.x + 4 * s, c.y - 6 * s, 42 * s, 32 * s);
        ellipse(c.x + 24 * s, c.y + 1 * s, 32 * s, 22 * s);
    }
    // distant hills
    fill(125, 175, 140);
    ellipse(80, 300, 280, 130);
    ellipse(320, 305, 320, 120);
    fill(100, 155, 115);
    ellipse(200, 305, 300, 95);
    // far pine silhouettes
    fill(70, 125, 85);
    for (var pt = 0; pt < 14; pt++) {
        var px = pt * 30 + 5;
        var ph = 50 + (pt * 37) % 30;
        triangle(px - 14, 262, px + 14, 262, px, 262 - ph);
    }
    // canopies with shading
    fill(28, 88, 30);
    for (var cc = 0; cc < forestCanopies.length; cc++) {
        var cn = forestCanopies[cc];
        ellipse(cn[0] + 4, cn[1] + 6, cn[2], cn[3]);
    }
    fill(34, 100, 34);
    for (var cc2 = 0; cc2 < forestCanopies.length; cc2++) {
        var cn2 = forestCanopies[cc2];
        ellipse(cn2[0], cn2[1], cn2[2], cn2[3]);
    }
    fill(60, 135, 55, 150);
    for (var cc3 = 0; cc3 < forestCanopies.length; cc3++) {
        var cn3 = forestCanopies[cc3];
        ellipse(cn3[0] - cn3[2] * 0.15, cn3[1] - cn3[3] * 0.2, cn3[2] * 0.5, cn3[3] * 0.4);
    }
    // trunks with bark
    for (var tt = 0; tt < forestTrunks.length; tt++) {
        var tr = forestTrunks[tt];
        noStroke();
        fill(66, 50, 0);
        rect(tr[0], tr[1], tr[2], tr[3]);
        fill(50, 37, 0);
        rect(tr[0], tr[1], tr[2] * 0.35, tr[3]);
        stroke(40, 28, 0, 160); strokeWeight(1);
        for (var bk = tr[1] + 6; bk < tr[1] + tr[3] - 4; bk += 10) {
            line(tr[0] + tr[2] * 0.5, bk, tr[0] + tr[2] * 0.7, bk + 5);
        }
        noStroke();
    }
    // ground layers
    fill(80, 140, 50);
    rect(0, 295, 400, 105);
    fill(60, 110, 35);
    rect(0, 308, 400, 92);
    fill(52, 96, 30);
    rect(0, 345, 400, 55);
    // flowers
    for (var fl = 0; fl < forestFlowers.length; fl++) {
        var f = forestFlowers[fl];
        stroke(50, 110, 40); strokeWeight(1);
        line(f.x, f.y, f.x, f.y - 5);
        noStroke();
        fill(f.r, f.g, f.b);
        ellipse(f.x - 2, f.y - 6, 3, 3);
        ellipse(f.x + 2, f.y - 6, 3, 3);
        ellipse(f.x, f.y - 8, 3, 3);
        ellipse(f.x, f.y - 4, 3, 3);
        fill(255, 220, 60);
        ellipse(f.x, f.y - 6, 2, 2);
    }
    // grass blades, gently swaying
    strokeWeight(1);
    for (var gb = 0; gb < forestGrass.length; gb++) {
        var gr = forestGrass[gb];
        var sway = sin(frameCount * 2 + gr.x * 3) * 1.5;
        stroke(40, gr.g, 30);
        line(gr.x, 297, gr.x + sway, 297 - gr.h);
    }
    noStroke();
};

var drawForestMotes = function() {
    noStroke();
    for (var i = 0; i < forestMotes.length; i++) {
        var m = forestMotes[i];
        m.x += m.vx + sin(frameCount * 1.5 + m.p) * 0.3;
        m.y += m.vy;
        if (m.y < 70) { m.y = 300; m.x = random(0, 400); }
        if (m.x < -5) { m.x = 405; }
        if (m.x > 405) { m.x = -5; }
        var tw = 110 + 80 * sin(frameCount * 4 + m.p);
        fill(255, 250, 200, tw * 0.3);
        ellipse(m.x, m.y, 7, 7);
        fill(255, 250, 200, tw);
        ellipse(m.x, m.y, 2.5, 2.5);
    }
};

var drawNest = function() {
    noStroke();
    fill(120, 80, 30);
    arc(nestX, nestY + 90, 50, 22, 0, 180);
    fill(100, 65, 20);
    arc(nestX, nestY + 90, 36, 22, 0, 180);
    // woven twigs
    stroke(80, 50, 15); strokeWeight(1);
    for (var tw = 0; tw < 7; tw++) {
        var tx = nestX - 21 + tw * 7;
        line(tx, nestY + 91, tx + 6, nestY + 98);
        line(tx + 6, nestY + 91, tx, nestY + 98);
    }
    noStroke();
    for (var i = 0; i < eggs.length; i++) {
        var e = eggs[i];
        if (e.hatched) { continue; }
        var ey = e.y + EGG_DY;
        if (i === 3) {
            fill(180, 160, 120);
        } else if (e.cracked) {
            fill(200, 185, 140);
        } else {
            fill(220, 205, 160);
        }
        ellipse(e.x, ey, 10, 13);
        // speckles + shine
        fill(160, 140, 100, 180);
        ellipse(e.x - 2, ey + 1, 2, 2);
        ellipse(e.x + 2, ey + 3, 1.5, 1.5);
        ellipse(e.x + 1, ey - 3, 1.5, 1.5);
        fill(255, 255, 240, 150);
        ellipse(e.x - 2, ey - 3, 3, 4);
        if (e.cracked) {
            stroke(100, 80, 40); strokeWeight(1);
            line(e.x - 2, ey - 3, e.x + 1, ey);
            line(e.x + 1, ey, e.x - 1, ey + 3);
            if (e.clicks >= 3) { line(e.x + 1, ey, e.x + 4, ey - 2); }
            noStroke();
        }
        if (e.clicks > 0 && !e.hatched && i !== 3) {
            fill(255, 200, 100, 180);
            textSize(7); textAlign(CENTER);
            text(e.clicks + "/5", e.x, ey - 9);
        }
    }
};

var drawMagicDoor = function() {
    var dx = treeX - 20;
    var dy = 295;
    // roots around door
    noStroke();
    fill(80, 50, 15);
    ellipse(dx - 10, dy + 10, 40, 16);
    ellipse(dx + 30, dy + 12, 35, 14);
    stroke(60, 40, 10); strokeWeight(3);
    line(dx - 15, dy + 8, dx - 30, dy + 20);
    line(dx + 40, dy + 8, dx + 55, dy + 18);
    noStroke();
    // door frame glow
    fill(180, 100, 255, 80);
    ellipse(dx + 10, dy - 5, 36, 46);
    // door itself
    fill(40, 10, 70);
    rect(dx - 6, dy - 22, 32, 36);
    // door arch top
    fill(40, 10, 70);
    ellipse(dx + 10, dy - 22, 32, 20);
    // door planks + knob
    stroke(60, 20, 95); strokeWeight(1);
    line(dx + 4, dy - 28, dx + 4, dy + 13);
    line(dx + 16, dy - 28, dx + 16, dy + 13);
    noStroke();
    fill(255, 200, 80);
    ellipse(dx + 20, dy - 2, 4, 4);
    // door glow border
    stroke(180, 80, 255); strokeWeight(2); noFill();
    rect(dx - 6, dy - 22, 32, 36);
    ellipse(dx + 10, dy - 22, 32, 20);
    noStroke();
    // sparkles on door
    var dpulse = sin(frameCount * 0.08) * 80;
    fill(200, 100, 255, 150 + dpulse);
    ellipse(dx + 2, dy - 15, 5, 5);
    ellipse(dx + 18, dy - 8, 4, 4);
    ellipse(dx + 8, dy + 5, 6, 6);
    // stars floating out
    fill(255, 180, 255, 100 + dpulse);
    ellipse(dx + 10, dy - 35 + sin(frameCount * 0.05) * 5, 8, 8);
    ellipse(dx - 5, dy - 28 + cos(frameCount * 0.07) * 4, 5, 5);
    ellipse(dx + 25, dy - 30 + sin(frameCount * 0.06) * 6, 6, 6);
};


var drawMainTree = function() {
    // if tree is falling or fallen, draw with rotation
    if (treeFallen || treeFallAngle > 0) {
        // treeFallAngle goes 0->90. At 0 = upright, at 90 = fully flat on ground.
        // We lerp the tree top from its upright position to a flat position on the ground.
        var progress = treeFallAngle / 90.0; // 0 to 1
        var baseX = treeX;
        var baseY = 310; // trunk base
        var uprightTopX = treeX;
        var uprightTopY = treeY; // about 200
        var flatTopX = treeX + 130; // falls to the right
        var flatTopY = 310;
        var topX = uprightTopX + (flatTopX - uprightTopX) * progress;
        var topY = uprightTopY + (flatTopY - uprightTopY) * progress;
        // splintered stump
        noStroke();
        fill(120, 85, 45);
        rect(baseX - 9, baseY - 12, 18, 12);
        fill(200, 170, 110);
        triangle(baseX - 9, baseY - 12, baseX - 4, baseY - 20, baseX, baseY - 12);
        triangle(baseX, baseY - 12, baseX + 5, baseY - 18, baseX + 9, baseY - 12);
        // draw trunk as a thick line from base to top
        stroke(101, 67, 33); strokeWeight(16);
        line(baseX, baseY, topX, topY);
        stroke(80, 52, 24); strokeWeight(5);
        line(baseX - 3, baseY, topX - 3, topY);
        // branches
        strokeWeight(8);
        stroke(90, 60, 28);
        var midX = baseX + (topX - baseX) * 0.5;
        var midY = baseY + (topY - baseY) * 0.5;
        line(midX, midY, midX + (topY-baseY)*0.2, midY - (topX-baseX)*0.2);
        // foliage at top
        noStroke();
        fill(34, 120, 34);
        ellipse(topX, topY, 90, 80);
        ellipse(topX - 25, topY - 15, 60, 55);
        ellipse(topX + 22, topY - 10, 60, 55);
        fill(27, 100, 27);
        ellipse(topX, topY + 5, 70, 55);
        fill(60, 150, 60, 150);
        ellipse(topX - 12, topY - 18, 34, 22);
        strokeWeight(1);
    } else {
        noStroke();
        fill(101, 67, 33);
        rect(treeX - 8, treeY + 20, 16, 120);
        fill(80, 52, 24);
        rect(treeX - 8, treeY + 20, 5, 120);
        // bark
        stroke(65, 42, 18, 170); strokeWeight(1);
        for (var bk = treeY + 30; bk < treeY + 135; bk += 12) {
            line(treeX - 1, bk, treeX + 3, bk + 6);
            line(treeX + 5, bk + 4, treeX + 4, bk + 9);
        }
        noStroke();
        // roots
        fill(101, 67, 33);
        triangle(treeX - 8, treeY + 128, treeX - 20, treeY + 140, treeX - 4, treeY + 140);
        triangle(treeX + 8, treeY + 128, treeX + 20, treeY + 140, treeX + 4, treeY + 140);
        fill(90, 60, 28);
        rect(treeX - 6, treeY + 40, 30, 8);
        rect(treeX - 26, treeY + 60, 30, 8);
        fill(27, 95, 27);
        ellipse(treeX + 4, treeY + 8, 94, 84);
        fill(34, 120, 34);
        ellipse(treeX, treeY, 90, 80);
        ellipse(treeX - 30, treeY + 20, 60, 55);
        ellipse(treeX + 28, treeY + 15, 60, 55);
        fill(27, 100, 27);
        ellipse(treeX, treeY + 10, 70, 60);
        fill(65, 155, 60, 160);
        ellipse(treeX - 14, treeY - 18, 38, 24);
        ellipse(treeX + 30, treeY + 2, 22, 16);
        ellipse(treeX - 38, treeY + 10, 20, 14);
        if (nestLeafsVisible) {
            noStroke();
            fill(120, 80, 20);
            ellipse(nestX, nestY - 5, 50, 25);
            fill(50, 130, 50);
            ellipse(nestX - 10, nestY - 8, 28, 18);
            ellipse(nestX + 10, nestY - 8, 28, 18);
            ellipse(nestX, nestY - 12, 30, 16);
            fill(40, 110, 40);
            ellipse(nestX - 5, nestY - 14, 20, 12);
            ellipse(nestX + 8, nestY - 13, 20, 12);
        }
        if (nestRevealed) { drawNest(); }
    }
    // magic door in roots after tree falls
    if (magicDoorVisible) {
        drawMagicDoor();
    }
};


var drawGroundLeaves = function() {
    for (var i = 0; i < groundLeaves.length; i++) {
        var lf = groundLeaves[i];
        if (lf.removed) { continue; }
        noStroke();
        fill(0, 0, 0, 40);
        ellipse(lf.x + lf.w * 0.5 + 2, lf.y + 3, lf.w * 0.9, lf.h * 0.6);
        fill(lf.r, lf.g, lf.b, 220);
        pushMatrix();
        translate(lf.x + lf.w * 0.5, lf.y);
        rotate(lf.rot);
        ellipse(0, 0, lf.w, lf.h);
        fill(lf.r + 30, lf.g + 25, lf.b + 10, 90);
        ellipse(-lf.w * 0.12, -lf.h * 0.15, lf.w * 0.5, lf.h * 0.35);
        stroke(lf.r - 30, lf.g - 30, lf.b, 120);
        strokeWeight(0.5);
        line(0, -lf.h * 0.4, 0, lf.h * 0.4);
        line(0, 0, -lf.w * 0.2, -lf.h * 0.25);
        line(0, 0, lf.w * 0.2, -lf.h * 0.25);
        noStroke();
        popMatrix();
    }
};

var drawWorm = function() {
    if (!worm.visible) { return; }
    noStroke();
    fill(0, 0, 0, 35); ellipse(worm.x + 12, worm.y + 4, 34, 4);
    for (var s = 0; s < 7; s++) {
        var wig = sin(frameCount * 6 + s * 45) * 1.6;
        var band = (s === 4);
        fill(band ? 205 : 195, band ? 110 : 110, band ? 110 : 105);
        ellipse(worm.x + s * 3.6, worm.y + wig, band ? 8 : 7, band ? 8 : 6.5);
        fill(225, 145, 140, 160);
        ellipse(worm.x + s * 3.6 - 0.5, worm.y + wig - 1.6, 3.5, 1.4);
        fill(160, 80, 75, 150);
        rect(worm.x + s * 3.6 + 1.6, worm.y + wig - 2.5, 0.8, 5);
    }
    var hw = sin(frameCount * 6 + 7 * 45) * 1.6;
    fill(205, 120, 115); ellipse(worm.x + 26, worm.y + hw - 0.5, 8, 7);
    fill(240, 175, 170, 180); ellipse(worm.x + 26.5, worm.y + hw - 2, 3, 1.5);
    fill(30); ellipse(worm.x + 27.5, worm.y + hw - 1, 1.6, 1.6);
};

var drawRock = function() {
    if (!rock.visible) { return; }
    noStroke();
    fill(0, 0, 0, 50);
    ellipse(rock.x + 2, rock.y + 6, 22, 6);
    fill(120, 115, 110);
    ellipse(rock.x, rock.y, 22, 16);
    fill(140, 135, 130);
    ellipse(rock.x - 3, rock.y - 3, 10, 7);
    fill(100, 95, 90);
    ellipse(rock.x + 5, rock.y + 3, 8, 5);
    fill(170, 165, 160);
    ellipse(rock.x - 4, rock.y - 4, 3, 2);
};

var drawForestBird = function() {
    if (bird.state === 0 && !bird.dead) { return; }
    drawSongbird(bird.x, bird.y, 1.05, 180, 120, 60, 0, bird.dead);
};

var drawHatchedBirds = function() {
    birdFlapTimer++;
    for (var i = 0; i < hatchedBirds.length; i++) {
        var b = hatchedBirds[i];
        if (!b.visible) { continue; }
        b.angle += b.speed;
        b.x = b.cx + cos(b.angle) * b.radius;
        b.y = b.cy + sin(b.angle) * b.radius * 0.4;
        drawSongbird(b.x, b.y, 0.85, b.r, b.g, b.b, i * 70, false);
    }
};

var drawMonsters = function() {
    for (var i = 0; i < monsters.length; i++) {
        var m = monsters[i];
        if (!m.visible) { continue; }
        m.angle += m.speed;
        m.x = m.cx + cos(m.angle) * m.radius;
        m.y = m.cy + sin(m.angle) * m.radius * 0.4;
        var s = m.size;
        var pulse = sin(frameCount * 0.1 + i) * 10;
        noStroke();
        fill(0, 0, 0, 40);
        ellipse(m.x, 312, 26 * s, 6 * s);
        drawPurpleMonster(m.x, m.y, s, m.r, m.g, m.b, 30 * s + pulse);
        if (monsterFedCounts[i] > 0) {
            fill(255, 255, 100, 180);
            textSize(7); textAlign(CENTER);
            text("fed:" + monsterFedCounts[i], m.x, m.y - 18 * s);
        }
        if (i === angryMonster && angryTimer > 0) {
            fill(255, 0, 0, 100);
            ellipse(m.x, m.y, 40 * s, 40 * s);
            fill(255, 255, 255);
            textSize(8); textAlign(CENTER);
            text("HUNGRY!", m.x, m.y - 22 * s);
        }
    }
};

var drawFox = function() {
    if (!fox.visible) { return; }
    if (fox.corpse) {
        drawFoxLying(fox.x, fox.y);
        return;
    }
    drawFoxDetailed(fox.x, fox.y, fox.vx !== 0);
    if (fox.clicks > 0) {
        fill(255, 80, 80, 200);
        textSize(8); textAlign(CENTER);
        text(fox.clicks + "/10", fox.x, fox.y - 28);
    }
};

var drawForestFoods = function() {
    for (var i = 0; i < forestFoods.length; i++) {
        var f = forestFoods[i];
        if (!f.visible) { continue; }
        noStroke();
        if (f.type === "berry") {
            fill(180, 30, 80);
            ellipse(f.x, f.y, 10, 10);
            ellipse(f.x + 8, f.y - 2, 10, 10);
            fill(255, 200, 220, 170);
            ellipse(f.x - 2, f.y - 2, 3, 3);
            ellipse(f.x + 6, f.y - 4, 3, 3);
            fill(0, 120, 0);
            stroke(0, 100, 0); strokeWeight(1);
            line(f.x + 4, f.y - 6, f.x + 6, f.y - 12);
            noStroke();
        } else if (f.type === "mushroom") {
            fill(200, 180, 140);
            rect(f.x + 2, f.y - 1, 6, 9);
            fill(200, 60, 40);
            ellipse(f.x + 5, f.y - 2, 16, 10);
            fill(255, 255, 255, 180);
            ellipse(f.x + 2, f.y - 3, 4, 3);
            ellipse(f.x + 8, f.y - 4, 3, 2);
        } else if (f.type === "grub") {
            fill(220, 200, 160);
            for (var s = 0; s < 3; s++) {
                ellipse(f.x + s * 5, f.y, 7, 6);
            }
            fill(180, 150, 100);
            ellipse(f.x + 13, f.y - 1, 7, 6);
            fill(0); ellipse(f.x + 15, f.y - 2, 2, 2);
        }
    }
};

var drawCorpse = function() {
    if (!corpse.visible) { return; }
    var alpha = 255 - floor(corpseEaten * 2.55);
    noStroke();
    fill(160, 90, 30, alpha);
    ellipse(corpse.x, corpse.y + 5, 40, 14);
    fill(180, 100, 40, alpha);
    ellipse(corpse.x + 18, corpse.y, 18, 14);
};

var drawReturnButton = function() {
    if (!returnToL1Button) { return; }
    noStroke();
    fill(40, 20, 80);
    rect(5, 375, 75, 20);
    fill(200, 150, 255);
    textSize(10); textAlign(CENTER);
    text("< Level 1", 42, 389);
};

var drawGoToForestButton = function() {
    if (!goToForestButton) { return; }
    noStroke();
    fill(40, 20, 80);
    rect(5, 375, 85, 20);
    fill(200, 150, 255);
    textSize(10); textAlign(CENTER);
    text("Forest >", 47, 389);
};

var drawPlayerMonsterL2 = function() {
    if (!playerMonster.visible) { return; }
    // if zooming to tree, move toward it
    if (monsterZoomingToTree) {
        var zdx = treeX - playerMonster.cx;
        var zdy = 200 - playerMonster.cy;
        var zd = sqrt(zdx*zdx + zdy*zdy);
        if (zd > 5) {
            playerMonster.cx += (zdx/zd) * 8;
            playerMonster.cy += (zdy/zd) * 8;
        } else {
            monsterZoomingToTree = 0;
            treeSmashing = 1;
            treeSmashTimer = 0;
        }
    }
    playerMonster.angle += playerMonster.speed;
    playerMonster.x = playerMonster.cx + cos(playerMonster.angle) * playerMonster.radius;
    playerMonster.y = playerMonster.cy + sin(playerMonster.angle) * playerMonster.radius * 0.3;
    var s = playerMonster.size;
    var pulse = sin(frameCount * 0.08) * 10;
    noStroke();
    drawPurpleMonster(playerMonster.x, playerMonster.y, s * 1.1, playerMonster.r, playerMonster.g, playerMonster.b, 38 * s + pulse);
};

var updateForestBird = function() {
    if (bird.dead) { bird.deadTimer++; return; }
    if (bird.state === 1) {
        if (!worm.visible) { bird.state = 0; return; }
        var dx = worm.x - bird.x; var dy = worm.y - bird.y;
        var d = sqrt(dx * dx + dy * dy);
        if (d > 5) {
            bird.x += dx * 0.03;
            bird.y += dy * 0.03;
        } else {
            bird.state = 2;
            if (forestStage < 2) { forestStage = 2; }
        }
    } else if (bird.state === 2) {
        var dx2 = nestX - bird.x; var dy2 = nestY - bird.y;
        bird.x += dx2 * 0.04;
        bird.y += dy2 * 0.04;
        if (abs(dx2) < 5 && abs(dy2) < 5) {
            bird.state = 1;
        }
    }
};

var updateForestStage = function() {
    if (forestStage === 5) {
        foxTimer++;
        if (foxTimer > 400 && !fox.visible) {
            fox.visible = 1; fox.x = -50; fox.vx = 1.2;
            forestStage = 6;
        }
    }
    if (forestStage === 6) {
        fox.x += fox.vx;
        if (fox.x > 350) { fox.vx = -abs(fox.vx); }
        if (fox.x < 20) { fox.vx = abs(fox.vx); }
    }
    if (forestStage === 8) {
        eatingTimer++;
        corpseEaten = min(100, floor(eatingTimer * 0.3));
        for (var i = 0; i < hatchedBirds.length; i++) {
            var b = hatchedBirds[i];
            var progress = min(1, eatingTimer / 300.0);
            b.r = floor(180 * (1 - progress) + 150 * progress);
            b.g = floor(130 * (1 - progress) + 20 * progress);
            b.b = floor(60 * (1 - progress) + 200 * progress);
        }
        if (eatingTimer > 300) {
            forestStage = 9;
            monsters = [];
            for (var mi = 0; mi < 3; mi++) {
                monsters.push({
                    x: 0, y: 0,
                    cx: 80 + mi * 110, cy: 200,
                    angle: random(0, 6.28),
                    radius: 50,
                    speed: 0.025,
                    r: floor(random(100, 180)),
                    g: floor(random(0, 60)),
                    b: floor(random(150, 255)),
                    visible: 1,
                    size: 1
                });
            }
            monsterFedCounts = [0, 0, 0];
            angryMonster = -1;
            hatchedBirds = [];
            corpse.visible = 0;
        }
    }
    if (forestStage === 9 && angryMonster >= 0) {
        var target = -1;
        var bestDist = 99999;
        for (var ai = 0; ai < monsters.length; ai++) {
            if (ai !== angryMonster && monsters[ai].visible) {
                var cdx = monsters[ai].x - monsters[angryMonster].x;
                var cdy = monsters[ai].y - monsters[angryMonster].y;
                var cd = sqrt(cdx*cdx + cdy*cdy);
                if (cd < bestDist) { bestDist = cd; target = ai; }
            }
        }
        if (target >= 0) {
            var tdx = monsters[target].cx - monsters[angryMonster].cx;
            var tdy = monsters[target].cy - monsters[angryMonster].cy;
            var td = sqrt(tdx*tdx + tdy*tdy);
            if (td > 1) {
                monsters[angryMonster].cx += (tdx/td) * 3;
                monsters[angryMonster].cy += (tdy/td) * 3;
            }
            if (td < 40) { monsters[target].visible = 0; }
        }
        var allEaten = 1;
        for (var ae = 0; ae < monsters.length; ae++) {
            if (ae !== angryMonster && monsters[ae].visible) { allEaten = 0; }
        }
        if (allEaten) {
            monsters[angryMonster].size = 1.4;
            monsters[angryMonster].cx = 200;
            monsters[angryMonster].cy = 200;
            forestStage = 10;
            returnToL1Button = 1;
            playerMonster.r = monsters[angryMonster].r;
            playerMonster.g = monsters[angryMonster].g;
            playerMonster.b = monsters[angryMonster].b;
        }
    }
    // tree smash animation
    if (treeSmashing) {
        treeSmashTimer++;
        // shake first
        if (treeSmashTimer < 30) {
            treeX = 110 + floor(random(-4, 4));
        } else {
            treeX = 110; // stop wobbling once falling
        }
        // then fall - increment angle by 3 each frame so it smoothly tips to 90
        if (treeSmashTimer >= 30) {
            treeFallAngle += 3;
            if (treeFallAngle >= 90) {
                treeFallAngle = 90;
                treeFallen = 1;
                treeSmashing = 0;
                magicDoorVisible = 1;
            }
        }
    }
};

var level2ForestMousePressed = function() {
    // level 3 screen click to dismiss
    if (level3Screen) {
        level3Screen = 0;
        return;
    }
    if (returnToL1Button &&
        mouseX >= 5 && mouseX <= 80 &&
        mouseY >= 375 && mouseY <= 395) {
        level = 1;
        playerMonster.visible = 1;
        playerMonster.cx = 200; playerMonster.cy = 80;
        playerMonster.x = 200; playerMonster.y = 80;
        playerMonster.fedCount = 0;
        l1FoodIndex = 0;
        l1CurrentFood.type = l1NewFoodTypes[0];
        l1CurrentFood.x = 200; l1CurrentFood.y = 320;
        l1CurrentFood.visible = 1;
        return;
    }
    // go to forest button (after monster ate wolf)
    if (goToForestButton &&
        mouseX >= 5 && mouseX <= 90 &&
        mouseY >= 375 && mouseY <= 395) {
        level = 2;
        playerMonster.visible = 1;
        playerMonster.cx = 200; playerMonster.cy = 100;
        monsterZoomingToTree = 0;
        return;
    }
    // click tree to smash it (only when giant monster is here)
    if (monsterAteWolf && playerMonster.visible && !treeSmashing && !treeFallen && !monsterZoomingToTree) {
        if (mouseX >= treeX - 50 && mouseX <= treeX + 50 &&
            mouseY >= treeY - 50 && mouseY <= treeY + 150) {
            monsterZoomingToTree = 1;
            return;
        }
    }
    // click magic door -> go to level 3
    if (magicDoorVisible) {
        var dx = treeX - 20;
        var dy = 295;
        if (mouseX >= dx - 10 && mouseX <= dx + 30 &&
            mouseY >= dy - 28 && mouseY <= dy + 20) {
            level = 3;
            initCaveCritters();
            caveRoom = 0;
            cavePotContents = [];
            cavePot.x = 180; cavePot.y = 300; cavePot.visible = 1;
            altarVisible = 0; altarActivated = 0;
            bossAlive = 0; bossDead = 0; bossHP = bossMaxHP;
            l3Portal = 0; caveFighters = [];
            return;
        }
    }
    for (var i = groundLeaves.length - 1; i >= 0; i--) {
        var lf = groundLeaves[i];
        if (lf.removed) { continue; }
        if (mouseX >= lf.x && mouseX <= lf.x + lf.w &&
            mouseY >= lf.y - lf.h && mouseY <= lf.y + lf.h) {
            lf.removed = 1;
            if (i === wormLeaf) { worm.visible = 1; }
            if (i === rockLeaf) { rock.visible = 1; }
            for (var fi = 0; fi < forestFoodLeaves.length; fi++) {
                if (i === forestFoodLeaves[fi]) { forestFoods[fi].visible = 1; }
            }
            break;
        }
    }
    if (worm.visible &&
        mouseX >= worm.x - 5 && mouseX <= worm.x + 30 &&
        mouseY >= worm.y - 8 && mouseY <= worm.y + 8) {
        draggingBtn = worm;
        dragOffsetX = mouseX - worm.x;
        dragOffsetY = mouseY - worm.y;
        return;
    }
    if (rock.visible &&
        mouseX >= rock.x - 12 && mouseX <= rock.x + 12 &&
        mouseY >= rock.y - 10 && mouseY <= rock.y + 10) {
        draggingBtn = rock;
        dragOffsetX = mouseX - rock.x;
        dragOffsetY = mouseY - rock.y;
        return;
    }
    for (var fdi = 0; fdi < forestFoods.length; fdi++) {
        var fd = forestFoods[fdi];
        if (fd.visible &&
            mouseX >= fd.x - 8 && mouseX <= fd.x + 16 &&
            mouseY >= fd.y - 8 && mouseY <= fd.y + 12) {
            draggingBtn = fd;
            dragOffsetX = mouseX - fd.x;
            dragOffsetY = mouseY - fd.y;
            return;
        }
    }
    if (nestLeafsVisible && forestStage >= 2 &&
        mouseX >= nestX - 25 && mouseX <= nestX + 25 &&
        mouseY >= nestY - 20 && mouseY <= nestY + 10) {
        nestLeafsVisible = 0;
        nestRevealed = 1;
        forestStage = 3;
        initEggs();
        return;
    }
    if (nestRevealed && forestStage >= 3) {
        for (var ei = 0; ei < eggs.length; ei++) {
            var e = eggs[ei];
            if (e.hatched || ei === 3) { continue; }
            // hit test where the egg is actually drawn
            if (mouseX >= e.x - 6 && mouseX <= e.x + 6 &&
                mouseY >= e.y + EGG_DY - 8 && mouseY <= e.y + EGG_DY + 8) {
                e.clicks++;
                e.cracked = 1;
                if (e.clicks >= 5) {
                    e.hatched = 1;
                    hatchedBirds.push({
                        x: nestX, y: nestY,
                        cx: 150 + ei * 50, cy: 180,
                        angle: random(0, 6.28),
                        radius: 60 + ei * 20,
                        speed: 0.02 + random(0.005, 0.01),
                        r: floor(random(150, 200)),
                        g: floor(random(100, 150)),
                        b: floor(random(30, 80)),
                        visible: 1
                    });
                    var allHatched = 1;
                    for (var hi = 0; hi < 3; hi++) {
                        if (!eggs[hi].hatched) { allHatched = 0; }
                    }
                    if (allHatched) { forestStage = 5; foxTimer = 0; }
                }
                return;
            }
        }
    }
    if (fox.visible && !fox.corpse &&
        mouseX >= fox.x - 22 && mouseX <= fox.x + 32 &&
        mouseY >= fox.y - 20 && mouseY <= fox.y + 18) {
        fox.clicks++;
        if (fox.clicks >= 10) {
            fox.dead = 1; fox.corpse = 1;
            fox.vx = 0;
            forestStage = 7;
        }
        return;
    }
    if (fox.corpse && forestStage === 7 &&
        mouseX >= fox.x - 22 && mouseX <= fox.x + 22 &&
        mouseY >= fox.y - 8 && mouseY <= fox.y + 18) {
        forestStage = 8;
        corpse.x = fox.x; corpse.y = fox.y;
        corpse.visible = 1;
        fox.visible = 0;
        eatingTimer = 0;
        for (var bi = 0; bi < hatchedBirds.length; bi++) {
            hatchedBirds[bi].cx = fox.x + floor(random(-20, 20));
            hatchedBirds[bi].cy = fox.y;
            hatchedBirds[bi].radius = 20 + bi * 10;
        }
        return;
    }
};

var level2ForestMouseReleased = function() {
    if (draggingBtn === worm) {
        if (worm.y >= 290 && bird.state === 0 && forestStage === 0) {
            forestStage = 1;
            bird.state = 1;
            bird.x = nestX; bird.y = nestY;
        }
    }
    if (draggingBtn === rock) {
        if (bird.state === 1) {
            var rdx = rock.x - bird.x; var rdy = rock.y - bird.y;
            if (rdx * rdx + rdy * rdy < 50 * 50) {
                bird.dead = 1; bird.state = 3;
                bird.x = rock.x; bird.y = 310;
                rock.visible = 0;
                forestStage = 2;
            }
        }
    }
    if (forestStage === 9) {
        for (var fi = 0; fi < forestFoods.length; fi++) {
            var f = forestFoods[fi];
            if (draggingBtn === f) {
                for (var mi = 0; mi < monsters.length; mi++) {
                    var m = monsters[mi];
                    if (!m.visible) { continue; }
                    var mfdx = f.x - m.x; var mfdy = f.y - m.y;
                    if (mfdx * mfdx + mfdy * mfdy < 60 * 60) {
                        monsterFedCounts[mi]++;
                        f.visible = 0;
                        burst(m.x, m.y, m.r, m.g, m.b, 14, 2.5, 0);
                        var fed0 = monsterFedCounts[0];
                        var fed1 = monsterFedCounts[1];
                        var fed2 = monsterFedCounts[2];
                        if (fed0 >= 2 && fed1 >= 2 && fed2 === 0 && angryMonster < 0) {
                            angryMonster = 2; angryTimer = 600;
                        } else if (fed0 >= 2 && fed2 >= 2 && fed1 === 0 && angryMonster < 0) {
                            angryMonster = 1; angryTimer = 600;
                        } else if (fed1 >= 2 && fed2 >= 2 && fed0 === 0 && angryMonster < 0) {
                            angryMonster = 0; angryTimer = 600;
                        }
                        break;
                    }
                }
            }
        }
    }
    draggingBtn = -1;
};

var level2ForestMouseDragged = function() {
    if (draggingBtn !== -1 && draggingBtn !== null && draggingBtn.x !== undefined) {
        draggingBtn.x = mouseX - dragOffsetX;
        draggingBtn.y = mouseY - dragOffsetY;
    }
};

var drawLevel3Screen = function() {
    noStroke();
    fill(0, 0, 0, 220);
    rect(0, 0, 400, 400);
    // stars
    for (var i = 0; i < 30; i++) {
        fill(255, 255, 255, 150);
        var sx = (i * 137) % 400;
        var sy = (i * 97) % 280;
        ellipse(sx, sy, 2, 2);
    }
    // magic door big
    fill(60, 10, 100);
    rect(130, 120, 140, 180);
    ellipse(200, 120, 140, 60);
    stroke(180, 80, 255); strokeWeight(3); noFill();
    rect(130, 120, 140, 180);
    ellipse(200, 120, 140, 60);
    noStroke();
    var dpulse = sin(frameCount * 0.06) * 40;
    fill(150, 50, 255, 80 + dpulse);
    ellipse(200, 200, 120, 150);
    fill(255, 200, 255, 150 + dpulse);
    textSize(22); textAlign(CENTER);
    text("LEVEL 3", 200, 190);
    fill(200, 160, 255);
    textSize(12); textAlign(CENTER);
    text("Coming Soon...", 200, 220);
    fill(150, 100, 200);
    textSize(9); textAlign(CENTER);
    text("(click to go back)", 200, 260);
};

var drawLevel2Forest = function() {
    drawForestBackground();
    drawMainTree();
    drawGroundLeaves();
    drawWorm();
    drawRock();
    drawForestFoods();
    drawForestBird();
    if (forestStage >= 5) { drawHatchedBirds(); }
    drawFox();
    if (forestStage >= 8) { drawCorpse(); }
    if (forestStage >= 9) { drawMonsters(); }
    if (playerMonster.visible) { drawPlayerMonsterL2(); }
    drawForestMotes();
    drawReturnButton();
    drawGoToForestButton();
    updateForestBird();
    updateForestStage();
};


// ============ LEVEL 1 ============
var Col = {col1:255, col2:221, col3:148};
var Col2 = {col1:150, col2:150, col3:150};
var wareWolf = false;
var noseEndx = 206;
var noseEndy = 112;
var StrokeWeight1 = 0;
var ear1End = 82;
var ear2End = 82;
var eyeCol = {r:0, g:0, b:0};
var Trans = 140;
var Trans2 = 170;
var leavesDetached = 0;
var drops = [];
var leafFireParticles = [];
var squirrelFireParticles = [];
var gameStage = 0;
var ear1 = function(){
    fill(Col.col1,Col.col2,Col.col3);
    triangle(182, ear1End, 200, 82, 181, 105);
};
var ear2 = function(){
    fill(Col.col1,Col.col2,Col.col3);
    triangle(216, ear2End, 205, 82, 219, 105);
};
var lupin = function(){
    fill(Col.col1,Col.col2,Col.col3);
    ellipse(200,100,50,50);
    fill(Col2.col1,Col2.col2,Col2.col3);
    rect(179,122,43,100);
    stroke(Col2.col1,Col2.col2,Col2.col3);
    strokeWeight(10);
    line(178,127,148,225);
    line(219,127,253,225);
    line(219,217,225,289);
    line(185,217,179,287);
    strokeWeight(1);
    stroke(eyeCol.r,eyeCol.g,eyeCol.b);
    line(189,91,190,110);
    line(209,92,209,110);
    stroke(0);
    fill(Col.col1,Col.col2,Col.col3);
    triangle(195, 108, noseEndx, noseEndy, 196, 117);
    stroke(Col.col1,Col.col2,Col.col3);
    line(195, 108, 196, 117);
};
var moon = {x:300, y:41};
var sun = {x:470, y:41}; // far enough right that its glow stays off-screen at night
var cloud = {x:300, y:37, width:112, height:60};
var seed = {x:200, y:347, width:10, height:15};
var shovel = {x:-17, y:282, width:31, height:24};
var leaves = {x:50, y:320, width:40, height:30};
var dayTime = false;
var moonOffScreen = false;
var skyR = 30;
var skyG = 30;
var skyB = 30;
var itRaining = false;
var sunThereYet = false;
var holeExists = false;
var holeFilled = false;
var seedBuried = false;
var holeX = 0;
var holeY = 300;
var treeGrowth = 0;
var treeGrown = false;
var arrowVisible = false;
var leavesOnFire = false;
var leavesOnTree = false;
var nuts = [];
var nutsSpawned = 0;
var nutOnGround = -1;
var nutGrowth = 0;
var cookedNut = {x:0, y:0, visible:0, width:12, height:14};
var cookedNutDragging = 0;
var nutPaste = {x:0, y:0, visible:0, width:14, height:10};
var nutPasteDragging = 0;
var smokedPaste = {x:0, y:0, visible:0, width:14, height:10};
var smokedPasteDragging = 0;
var mushrooms = [];
var mushroomSpawnDelay = 0;
var mushroomGlowPulse = 0;
var cookedMushroom = {x:0, y:0, visible:0, width:16, height:18};
var cookedMushroomDragging = 0;
var puddle = {x:60, y:298, width:60, height:16, visible:0};
var puddleSize = 0;
var fishingLine = {active:0, x:0, y:0, hookY:0};
var fishCaught = 0;
var rawFish = {x:0, y:0, visible:0, width:22, height:12};
var rawFishDragging = 0;
var cookedFish = {x:0, y:0, visible:0, width:22, height:12};
var cookedFishDragging = 0;
var fishBobTimer = 0;
var fishOnHook = 0;
var reeling = 0;
var frog = {x:0, y:285, visible:0, caught:0, width:18, height:14};
var frogHopTimer = 0;
var frogHopInterval = 150;
var frogSpawned = 0;
var frogEmergeTimer = 0;
var frogEmerging = 0;
var cookedFrog = {x:0, y:0, visible:0, width:18, height:12};
var cookedFrogDragging = 0;
var catchWindowOpen = 0;
var catchTimer = 0;
var squirrelSpawnDelay = 0;
var cursedApple = {x:0, y:0, visible:0, width:16, height:18};
var cursedAppleDragging = 0;
var cursedAppleGrowth = 0;
var cursedAppleDelay = 0;
var cursedApplePulse = 0;
var wolfAngry = 0;
var wolfAngryTimer = 0;
var wolfShakeX = 0;
var moonberries = [];
var moonberriesSpawned = 0;
var moonberryPulse = 0;
var moonberryAnimTimer = 0;
var moonberryStars = [];
var moonberriesFed = 0;
var bushGrowth = 0;
var bushGrowDelay = 0;
var moonstone = {x:0, y:0, visible:0, width:14, height:14};
var moonstoneDragging = 0;
var moonstoneSpawned = 0;
var moonstonePulse = 0;
var crystalCandy = {x:0, y:0, visible:0, width:14, height:12};
var crystalCandyDragging = 0;
var eclipseBerry = {x:0, y:0, visible:0, width:12, height:12};
var eclipseBerryDragging = 0;
var eclipseActive = 0;
var eclipseTimer = 0;
var sunDragging = 0;
var rainbowStars = [];
var rainbowStarTimer = 0;

// level 1 scenery data
var nightStars = [];
for (var nsi = 0; nsi < 70; nsi++) {
    nightStars.push({x: random(0, 400), y: random(0, 270), s: random(1, 2.8), p: random(0, 360)});
}
var l1Grass = [];
for (var lgi = 0; lgi < 150; lgi++) {
    l1Grass.push({x: random(0, 400), h: random(4, 11), g: floor(random(140, 200))});
}
var soilPebbles = [];
for (var spi = 0; spi < 45; spi++) {
    soilPebbles.push({x: random(0, 400), y: random(314, 398), w: random(3, 9), c: floor(random(55, 100))});
}

var RainbowStar = function(x, y) {
    this.x = x; this.y = y;
    this.vx = random(-4, 4);
    this.vy = random(-5, -1);
    this.life = random(50, 100);
    this.maxLife = this.life;
    this.size = random(4, 12);
    this.r = floor(random(100, 255));
    this.g = floor(random(100, 255));
    this.b = floor(random(100, 255));
};
RainbowStar.prototype.update = function() {
    this.x += this.vx; this.y += this.vy;
    this.vy += 0.04; this.life--;
};

// ============ LEVEL 3 ============
var drawCaveBackground = function() {
    // dark cave background
    background(10, 5, 20);
    var cols = caveRoomColors[caveRoom];
    noStroke();
    // back wall, slightly lighter toward the middle
    for (var wy = 70; wy < 310; wy += 10) {
        var wk = 1 - abs(wy - 190) / 120;
        fill(14 + wk * 10, 8 + wk * 5, 26 + wk * 16);
        rect(0, wy, 400, 10);
    }
    // rock texture
    for (var sk = 0; sk < caveSpecks.length; sk++) {
        var sp = caveSpecks[sk];
        fill(45, 30, 70, sp.a);
        ellipse(sp.x, sp.y, sp.s * 1.6, sp.s);
        fill(5, 2, 12, sp.a);
        ellipse(sp.x + 1, sp.y + 1, sp.s * 0.8, sp.s * 0.5);
    }
    // soft room-colored ambience
    fill(cols[0].r, cols[0].g, cols[0].b, 14);
    ellipse(60, 230, 220, 160);
    fill(cols[1].r, cols[1].g, cols[1].b, 14);
    ellipse(340, 230, 220, 160);
    // cave walls - rocky jagged top
    fill(25, 15, 40);
    rect(0, 0, 400, 80);
    // stalactites
    for (var i = 0; i < 12; i++) {
        var sx = 20 + i * 33;
        var sh = 30 + floor(sin(i * 1.3) * 20);
        fill(30, 18, 50);
        triangle(sx - 10, 0, sx + 10, 0, sx, sh);
        fill(55, 38, 85, 150);
        triangle(sx - 6, 0, sx - 2, 0, sx - 1, sh - 4);
    }
    // ground
    fill(20, 12, 35);
    rect(0, 310, 400, 90);
    fill(28, 17, 45);
    for (var gb = 0; gb < 14; gb++) {
        ellipse(gb * 30 + 10, 312, 40, 12);
    }
    fill(15, 9, 28);
    rect(0, 350, 400, 50);
    // stalagmites
    for (var j = 0; j < 8; j++) {
        var gx = 30 + j * 50;
        var gh = 20 + floor(cos(j * 1.7) * 12);
        fill(30, 18, 50);
        triangle(gx - 8, 400, gx + 8, 400, gx, 400 - gh);
        fill(50, 34, 78, 150);
        triangle(gx - 5, 400, gx - 2, 400, gx - 1, 402 - gh);
    }
    // draw crystals for this room
    var crystalPositions = [
        [30, 260, 60, 240, 45, 200],
        [340, 255, 370, 235, 355, 195],
        [130, 270, 160, 250, 145, 210],
        [250, 265, 280, 245, 265, 205],
        [70, 300, 85, 280],
        [310, 295, 325, 275]
    ];
    for (var ci = 0; ci < crystalPositions.length; ci++) {
        var cp = crystalPositions[ci];
        var col = cols[ci % cols.length];
        var pulse = 150 + floor(sin(frameCount * 0.04 + ci) * 80);
        noStroke();
        // floor reflection
        fill(col.r, col.g, col.b, 22);
        ellipse(cp[0] + 10, 318, 44, 8);
        fill(col.r, col.g, col.b, 40);
        ellipse(cp[0], cp[1], 30, 50);
        if (cp.length >= 6) {
            var ccx = (cp[0] + cp[2]) / 2; var cby = max(cp[1], cp[3]) + 4; var chh = cby - cp[5];
            drawCrystalColumn(ccx - 13, cby + 2, 11, chh * 0.55, -24, col.r, col.g, col.b, pulse);
            drawCrystalColumn(ccx + 13, cby + 2, 12, chh * 0.68, 20, col.r, col.g, col.b, pulse);
            drawCrystalColumn(ccx, cby, 18, chh, 0, col.r, col.g, col.b, pulse);
            if ((frameCount + ci * 37) % 120 < 14) {
                var sk = ((frameCount + ci * 37) % 120) / 14;
                stroke(255, 255, 255, 220 * sin(sk * 180)); strokeWeight(1);
                line(ccx - 5, cp[5] + 2, ccx + 5, cp[5] + 2); line(ccx, cp[5] - 3, ccx, cp[5] + 7);
                noStroke();
            }
        } else {
            drawCrystalColumn((cp[0] + cp[2]) / 2 - 5, cp[1] + 2, 9, 24, -14, col.r, col.g, col.b, pulse);
            drawCrystalColumn((cp[0] + cp[2]) / 2 + 4, cp[1] + 2, 11, 32, 8, col.r, col.g, col.b, pulse);
        }
    }
    // glowing fungi
    var fc = cols[1];
    for (var fu = 0; fu < caveFungi.length; fu++) {
        var fx = caveFungi[fu][0]; var fy = caveFungi[fu][1];
        var fg = 140 + floor(sin(frameCount * 3 + fu * 70) * 70);
        fill(fc.r, fc.g, fc.b, 30);
        ellipse(fx, fy - 4, 26, 18);
        fill(190, 180, 200);
        rect(fx - 1, fy - 5, 2, 6);
        rect(fx + 5, fy - 3, 2, 4);
        fill(fc.r, fc.g, fc.b, fg);
        arc(fx, fy - 5, 10, 8, 180, 360);
        arc(fx + 6, fy - 3, 7, 5, 180, 360);
    }
    // water drips
    for (var dr = 0; dr < caveDrips.length; dr++) {
        var d = caveDrips[dr];
        if (d.wait > 0) {
            d.wait--;
            d.y = d.top;
            var grow = 1 - d.wait / 260;
            fill(130, 190, 255, 200);
            ellipse(d.x, d.top + 1, 2 + grow * 2, 2 + grow * 3);
        } else {
            d.v += 0.25;
            d.y += d.v;
            fill(130, 190, 255, 220);
            ellipse(d.x, d.y, 3, 5);
            if (d.y > 310) {
                burst(d.x, 310, 120, 180, 255, 4, 1.2, 0.12);
                d.y = d.top; d.v = 0;
                d.wait = floor(random(90, 260));
            }
        }
    }
    // floating dust in room color
    var mc = cols[2];
    for (var mo = 0; mo < caveMotes.length; mo++) {
        var m = caveMotes[mo];
        m.x += m.vx + sin(frameCount + m.p) * 0.15;
        m.y += m.vy;
        if (m.x < 0) { m.x = 400; } if (m.x > 400) { m.x = 0; }
        if (m.y < 60) { m.y = 320; } if (m.y > 320) { m.y = 60; }
        var ma = 60 + 60 * sin(frameCount * 3 + m.p);
        fill(mc.r, mc.g, mc.b, ma);
        ellipse(m.x, m.y, 2, 2);
    }
    // vignette
    noFill();
    stroke(0, 0, 0, 70); strokeWeight(80);
    ellipse(200, 200, 620, 620);
    stroke(0, 0, 0, 45); strokeWeight(40);
    ellipse(200, 200, 500, 500);
    noStroke(); strokeWeight(1);
    // room label
    fill(150, 100, 200, 150);
    textSize(8); textAlign(LEFT);
    text("Room " + (caveRoom + 1) + "/4", 8, 15);
};

var drawCaveArrows = function() {
    // left arrow (go to prev room) if not room 0
    if (caveRoom > 0) {
        noStroke();
        fill(180, 100, 255, 40);
        ellipse(30, 200, 50, 60);
        fill(180, 100, 255, 180);
        triangle(15, 200, 40, 175, 40, 225);
        fill(220, 180, 255);
        textSize(8); textAlign(CENTER);
        text("<", 25, 204);
    }
    // right arrow (go to next room) if not room 3
    if (caveRoom < 3) {
        noStroke();
        fill(180, 100, 255, 40);
        ellipse(370, 200, 50, 60);
        fill(180, 100, 255, 180);
        triangle(385, 200, 360, 175, 360, 225);
        fill(220, 180, 255);
        textSize(8); textAlign(CENTER);
        text(">", 378, 204);
    }
};

var drawCavePot = function() {
    if (!cavePot.visible) { return; }
    var px = cavePot.x; var py = cavePot.y;
    noStroke();
    fill(0, 0, 0, 70);
    ellipse(px, py + 16, 40, 8);
    // pot body
    fill(60, 30, 10);
    ellipse(px, py + 8, 36, 20);
    fill(80, 40, 15);
    rect(px - 16, py - 8, 32, 18);
    fill(60, 30, 10);
    ellipse(px, py - 8, 32, 14);
    // shine + band
    fill(120, 70, 30, 150);
    rect(px - 12, py - 4, 4, 12);
    fill(50, 25, 8);
    rect(px - 16, py + 2, 32, 3);
    // pot rim
    fill(100, 55, 20);
    ellipse(px, py - 8, 36, 10);
    // handles
    stroke(70, 35, 10); strokeWeight(3);
    noFill();
    arc(px - 18, py - 2, 10, 14, 90, 270);
    arc(px + 18, py - 2, 10, 14, -90, 90);
    noStroke();
    // contents glow if stuff inside
    var n = cavePotContents.length;
    if (n > 0) {
        fill(150, 0, 255, 80 + floor(sin(frameCount * 0.1) * 40));
        ellipse(px, py - 10, 28, 10);
        // bubbles
        var bub = (frameCount * 0.6) % 20;
        fill(210, 150, 255, 200 - bub * 10);
        ellipse(px - 5, py - 10 - bub, 3, 3);
        ellipse(px + 6, py - 12 - (bub * 0.7), 2, 2);
        fill(200, 100, 255, 180);
        textSize(7); textAlign(CENTER);
        text(n + "/" + l3CritterTypes.length, px, py - 20);
    }
    // label
    fill(180, 140, 100);
    textSize(7); textAlign(CENTER);
    text("pot", px, py + 22);
    if (cavePotContents.length >= l3CritterTypes.length) {
        fill(255, 100, 255, 200);
        textSize(8); textAlign(CENTER);
        text("FULL! Go to room 4!", px, py - 30);
    }
};

var drawCaveAltar = function() {
    if (caveRoom !== 3) { return; }
    var ax = altarX; var ay = altarY;
    noStroke();
    // base
    fill(50, 20, 70);
    rect(ax - 35, ay + 10, 70, 20);
    rect(ax - 25, ay - 10, 50, 22);
    fill(35, 12, 50);
    rect(ax - 35, ay + 24, 70, 6);
    // top slab
    fill(70, 30, 100);
    rect(ax - 30, ay - 14, 60, 8);
    // glow
    var ag = 100 + floor(sin(frameCount * 0.06) * 60);
    fill(150, 0, 255, ag);
    ellipse(ax, ay - 10, 50, 20);
    // runes
    stroke(200, 100, 255, 180); strokeWeight(1);
    line(ax - 20, ay - 12, ax - 15, ay - 6);
    line(ax - 15, ay - 6, ax - 10, ay - 12);
    line(ax, ay - 12, ax, ay - 6);
    line(ax + 10, ay - 12, ax + 15, ay - 6);
    line(ax + 15, ay - 6, ax + 20, ay - 12);
    line(ax - 18, ay + 2, ax - 12, ay + 8);
    line(ax + 12, ay + 2, ax + 18, ay + 8);
    noStroke();
    if (!altarActivated) {
    }
};

var drawCaveCritter = function(c) {
    var cx = c.x; var cy = c.y;
    if (c.type === "eyeball") {
        noStroke();
        fill(240, 220, 200);
        ellipse(cx, cy, 20, 18);
        // veins
        stroke(200, 80, 80, 150); strokeWeight(0.7);
        line(cx - 9, cy - 2, cx - 5, cy - 1);
        line(cx + 9, cy + 3, cx + 5, cy + 2);
        noStroke();
        fill(80, 200, 80);
        ellipse(cx, cy, 12, 12);
        fill(0);
        ellipse(cx + 1, cy, 6, 6);
        fill(255, 255, 255, 200);
        ellipse(cx + 3, cy - 2, 3, 3);
        // tentacles
        stroke(200, 180, 160); strokeWeight(1);
        for (var t = 0; t < 5; t++) {
            var ta = t * 72 + frameCount * 2;
            line(cx + cos(ta) * 10, cy + sin(ta) * 9,
                 cx + cos(ta) * 18, cy + sin(ta) * 16 + sin(frameCount * 0.1 + t) * 4);
        }
        noStroke();
    } else if (c.type === "waxcandle") {
        noStroke();
        fill(220, 200, 170);
        rect(cx - 5, cy - 14, 10, 20);
        fill(200, 180, 150);
        ellipse(cx, cy + 6, 12, 6);
        // melting wax drips
        fill(220, 200, 170);
        ellipse(cx - 3, cy - 2, 5, 8);
        ellipse(cx + 4, cy, 4, 6);
        // flame
        var fl = sin(frameCount * 12) * 1.5;
        fill(255, 255, 200, 50);
        ellipse(cx, cy - 16, 18, 20);
        fill(255, 200, 0);
        ellipse(cx + fl * 0.3, cy - 16, 5, 8 + fl);
        fill(255, 100, 0);
        ellipse(cx, cy - 14, 3, 5);
        fill(255, 255, 200, 150);
        ellipse(cx, cy - 12, 8, 8);
        // face
        fill(80, 60, 40);
        ellipse(cx - 2, cy - 6, 2, 2);
        ellipse(cx + 2, cy - 6, 2, 2);
        stroke(80, 60, 40); strokeWeight(1);
        line(cx - 2, cy - 3, cx + 2, cy - 3);
        noStroke();
    } else if (c.type === "shadow") {
        noStroke();
        fill(20, 10, 40, 180);
        ellipse(cx, cy + 4, 24, 12);
        fill(30, 15, 60, 200);
        ellipse(cx, cy, 18, 22);
        fill(10, 5, 25, 220);
        ellipse(cx, cy - 6, 14, 16);
        // glowing eyes
        fill(180, 0, 255, 60);
        ellipse(cx, cy - 4, 18, 9);
        fill(180, 0, 255);
        ellipse(cx - 3, cy - 4, 5, 5);
        ellipse(cx + 3, cy - 4, 5, 5);
        fill(220, 100, 255);
        ellipse(cx - 3, cy - 4, 2, 2);
        ellipse(cx + 3, cy - 4, 2, 2);
        // wispy tendrils
        fill(40, 20, 80, 120);
        ellipse(cx - 8, cy + 2 + sin(frameCount * 5) * 2, 8, 14);
        ellipse(cx + 8, cy + 2 - sin(frameCount * 5) * 2, 8, 14);
    } else if (c.type === "mouth") {
        noStroke();
        fill(180, 60, 80);
        ellipse(cx, cy, 22, 14);
        fill(120, 30, 50);
        ellipse(cx, cy + 1, 14, 6);
        // teeth top
        fill(240, 230, 220);
        for (var ti = 0; ti < 4; ti++) {
            triangle(cx - 8 + ti*5, cy - 4, cx - 5 + ti*5, cy - 10, cx - 3 + ti*5, cy - 4);
        }
        // teeth bottom
        for (var bi2 = 0; bi2 < 3; bi2++) {
            triangle(cx - 5 + bi2*5, cy + 4, cx - 2 + bi2*5, cy + 9, cx + 1 + bi2*5, cy + 4);
        }
        // tongue
        fill(220, 80, 100);
        ellipse(cx + 2, cy + 2, 10, 6);
        // legs
        fill(150, 50, 70);
        rect(cx - 8, cy + 6, 4, 8);
        rect(cx - 2, cy + 6, 4, 9);
        rect(cx + 4, cy + 6, 4, 8);
    } else if (c.type === "jar") {
        noStroke();
        fill(160, 200, 220, 180);
        ellipse(cx, cy + 4, 18, 20);
        fill(140, 180, 200, 180);
        rect(cx - 7, cy - 6, 14, 12);
        fill(180, 220, 240, 160);
        ellipse(cx, cy - 6, 14, 6);
        fill(80, 60, 30);
        ellipse(cx, cy - 8, 12, 5);
        // soul inside - glowing
        var sp = 150 + floor(sin(frameCount * 0.12) * 80);
        fill(200, 255, sp, 60);
        ellipse(cx, cy, 16, 18);
        fill(200, 255, sp, 200);
        ellipse(cx, cy, 8, 10);
        fill(255, 255, 255, 150);
        ellipse(cx - 1, cy - 2, 3, 4);
        // soul face
        fill(0, 100, 150);
        ellipse(cx - 2, cy - 1, 2, 2);
        ellipse(cx + 2, cy - 1, 2, 2);
        // glass shine
        fill(255, 255, 255, 110);
        rect(cx - 6, cy - 4, 2, 10);
    } else if (c.type === "bonespider") {
        noStroke();
        // legs
        stroke(200, 190, 170); strokeWeight(2);
        for (var bl = 0; bl < 4; bl++) {
            var ba = bl * 45 - 90 + sin(frameCount * 0.15) * 10;
            line(cx, cy, cx + cos(ba) * 14, cy + sin(ba) * 10);
            line(cx, cy, cx - cos(ba) * 14, cy + sin(ba) * 10);
        }
        noStroke();
        fill(210, 200, 180);
        ellipse(cx, cy, 14, 10);
        ellipse(cx + 6, cy - 3, 9, 8);
        fill(0);
        ellipse(cx + 5, cy - 4, 3, 3);
        ellipse(cx + 8, cy - 4, 3, 3);
        fill(255, 60, 60, 200);
        ellipse(cx + 5, cy - 4, 1, 1);
        ellipse(cx + 8, cy - 4, 1, 1);
        // skull details
        fill(180, 170, 150);
        ellipse(cx - 2, cy + 1, 4, 3);
        ellipse(cx + 3, cy + 1, 4, 3);
    } else if (c.type === "rockface") {
        noStroke();
        fill(100, 90, 80);
        ellipse(cx, cy, 24, 20);
        fill(125, 115, 105);
        ellipse(cx - 4, cy - 5, 12, 7);
        fill(80, 70, 60);
        ellipse(cx - 5, cy + 3, 10, 8);
        ellipse(cx + 6, cy + 2, 8, 7);
        // eyes
        fill(255, 80, 0, 60);
        ellipse(cx, cy - 3, 20, 9);
        fill(255, 80, 0);
        ellipse(cx - 4, cy - 3, 6, 6);
        ellipse(cx + 4, cy - 3, 6, 6);
        fill(200, 40, 0);
        ellipse(cx - 4, cy - 3, 3, 3);
        ellipse(cx + 4, cy - 3, 3, 3);
        // teeth mouth
        fill(40, 30, 20);
        arc(cx, cy + 4, 14, 8, 0, 180);
        fill(220, 210, 200);
        triangle(cx - 4, cy + 4, cx - 2, cy + 9, cx, cy + 4);
        triangle(cx + 1, cy + 4, cx + 3, cy + 9, cx + 5, cy + 4);
    }
};

var drawCaveCritters = function() {
    for (var i = 0; i < caveCritters.length; i++) {
        var c = caveCritters[i];
        if (c.room !== caveRoom || c.inPot) { continue; }
        // the one you're carrying: draw it following the mouse
        if (draggingBtn === c) {
            noStroke();
            fill(200, 120, 255, 50);
            ellipse(c.x, c.y, 36, 36);
            drawCaveCritter(c);
            continue;
        }
        // handle crack emergence
        if (c.catchType === "crack" && !c.emerged) {
            c.emergeTimer++;
            if (c.emergeTimer > 120) { c.emerged = 1; burst(c.crackX, c.crackY + 6, 150, 60, 210, 10, 2, 0.1); }
            else {
                // show crack
                stroke(150, 50, 200); strokeWeight(1);
                line(c.crackX, c.crackY, c.crackX + 5, c.crackY + 8);
                line(c.crackX + 5, c.crackY + 8, c.crackX - 3, c.crackY + 14);
                if (c.emergeTimer > 50) {
                    line(c.crackX + 5, c.crackY + 8, c.crackX + 10, c.crackY + 11);
                }
                noStroke();
                if (c.emergeTimer > 80) {
                    fill(200, 100, 255, 150);
                    textSize(7); textAlign(CENTER);
                    text("...", c.crackX, c.crackY - 5);
                }
                continue;
            }
        }
        // handle rock hiding
        if (c.catchType === "rock" && !c.rockRemoved) {
            noStroke();
            fill(0, 0, 0, 60);
            ellipse(c.rockX + 9, c.rockY + 11, 26, 6);
            fill(90, 80, 70);
            ellipse(c.rockX + 8, c.rockY + 4, 24, 16);
            fill(110, 100, 90);
            ellipse(c.rockX + 5, c.rockY, 12, 9);
            fill(70, 62, 55);
            ellipse(c.rockX + 13, c.rockY + 7, 8, 5);
            continue;
        }
        // handle cage
        if (c.catchType === "cage" && !c.cageOpen) {
            var cgx = c.cageX; var cgy = c.cageY;
            noStroke(); fill(60, 40, 80);
            rect(cgx, cgy, 28, 32);
            stroke(120, 80, 160); strokeWeight(1);
            for (var b = 0; b < 4; b++) { line(cgx + b*8 + 4, cgy, cgx + b*8 + 4, cgy + 32); }
            line(cgx, cgy + 10, cgx + 28, cgy + 10);
            line(cgx, cgy + 22, cgx + 28, cgy + 22);
            noStroke();
            // padlock
            fill(180, 150, 60);
            rect(cgx + 11, cgy + 13, 7, 6);
            noFill(); stroke(180, 150, 60); strokeWeight(1);
            arc(cgx + 14.5, cgy + 13, 5, 6, 180, 360);
            noStroke();
            // draw critter inside cage (small)
            pushMatrix();
            translate(cgx + 14, cgy + 16);
            scale(0.6);
            drawCaveCritter({type: c.type, x:0, y:0});
            popMatrix();
            continue;
        }
        // roaming movement
        if (c.catchType === "roam") {
            c.x += c.vx;
            if (c.x < 50 || c.x > 350) { c.vx *= -1; }
        }
        noStroke();
        fill(0, 0, 0, 60);
        ellipse(c.x, c.y + 12, 18, 4);
        drawCaveCritter(c);
    }
};

// ============ BOSS FIGHT: you + helpers vs the Altar Beast ============
var playerHP = 5;
var playerMaxHP = 5;
var playerHurtTimer = 0;   // invulnerable frames after a hit
var playerHitCD = 0;       // time between your swings
var bossFightLost = 0;
var bossHitFlash = 0;
var bossAtk = {state: 0, timer: 120, type: 0, target: -1, t: 0, tx: 0, ty: 0, hitDone: 0};
var bossBolts = [];
var slashes = [];
var dmgTexts = [];
var PLAYER_DMG = 3;
var HELPER_DMG = 1;

var popDmg = function(x, y, txt, r, g, b) {
    dmgTexts.push({x: x, y: y, txt: txt, life: 45, r: r, g: g, b: b});
};
var aliveFighters = function() {
    var n = 0;
    for (var i = 0; i < caveFighters.length; i++) { if (caveFighters[i].hp > 0) { n++; } }
    return n;
};
var startBossFight = function() {
    bossAlive = 1; bossDead = 0; bossFightLost = 0;
    bossHP = bossMaxHP;
    bossX = altarX; bossY = altarY - 80;
    playerHP = playerMaxHP; playerHurtTimer = 0; playerHitCD = 0;
    bossAtk = {state: 0, timer: 150, type: 0, target: -1, t: 0, tx: 0, ty: 0, hitDone: 0};
    bossBolts = []; slashes = []; dmgTexts = [];
    // helpers - one of each critter type from the pot
    caveFighters = [];
    var used2 = {};
    for (var fi = 0; fi < cavePotContents.length; fi++) {
        var t = cavePotContents[fi];
        if (!used2[t]) {
            used2[t] = 1;
            caveFighters.push({type: t, x: 60 + fi * 40, y: 310, hp: 3,
                               cd: floor(random(90, 200)), lunge: 0, kx: 0, ky: 0, hurt: 0});
        }
    }
    // spread helpers around the underside of the beast
    for (var si = 0; si < caveFighters.length; si++) {
        var ang = caveFighters.length > 1 ? 15 + si * (150 / (caveFighters.length - 1)) : 90;
        caveFighters[si].slotA = ang;
    }
};
var hurtPlayer = function() {
    if (playerHurtTimer > 0 || playerHP <= 0) { return; }
    playerHP--;
    playerHurtTimer = 45;
    shake(7); flash(255, 0, 40, 90);
    burst(mouseX, mouseY, 255, 60, 60, 18, 3, 0.05);
    popDmg(mouseX, mouseY - 12, "-1 heart", 255, 90, 90);
    if (playerHP <= 0) { bossFightLost = 1; }
};
var hurtFighter = function(f, fromX, fromY) {
    if (f.hp <= 0) { return; }
    f.hp--;
    f.hurt = 20;
    var d = max(1, dist(fromX, fromY, f.x, f.y));
    f.kx = (f.x - fromX) / d * 18;
    f.ky = (f.y - fromY) / d * 18;
    burst(f.x, f.y, 255, 200, 200, 10, 2.5, 0.08);
    popDmg(f.x, f.y - 20, "-1", 255, 150, 150);
    if (f.hp <= 0) { burst(f.x, f.y, 200, 200, 200, 22, 3, 0.1); shake(3); }
};

var drawCaveFighters = function() {
    for (var i = 0; i < caveFighters.length; i++) {
        var f = caveFighters[i];
        if (f.hp <= 0) { continue; }
        var slotX = bossX + cos(f.slotA) * 72;
        var slotY = bossY + 20 + sin(f.slotA) * 58;
        var fdx = slotX - f.x; var fdy = slotY - f.y;
        var fd = sqrt(fdx * fdx + fdy * fdy);
        if (fd > 3) {
            f.x += (fdx / fd) * min(1.8, fd);
            f.y += (fdy / fd) * min(1.8, fd);
        } else if (!bossFightLost) {
            // in position: attack on its own cooldown
            f.cd--;
            if (f.cd <= 0) {
                f.lunge = 14;
                f.cd = floor(random(150, 230));
            }
        }
        var lx = 0; var ly = 0;
        if (f.lunge > 0) {
            // quick jab toward the beast, damage lands at the peak
            var lk = sin((14 - f.lunge) / 14 * 180);
            var ld = max(1, dist(f.x, f.y, bossX, bossY));
            lx = (bossX - f.x) / ld * 22 * lk;
            ly = (bossY - f.y) / ld * 22 * lk;
            if (f.lunge === 7) {
                bossHP -= HELPER_DMG;
                bossShakeX = floor(random(-3, 3));
                bossHitFlash = max(bossHitFlash, 4);
                burst(f.x + lx, f.y + ly, 255, 230, 150, 6, 2, 0);
                popDmg(f.x + lx, f.y + ly - 10, "-" + HELPER_DMG, 255, 230, 150);
            }
            f.lunge--;
        }
        f.kx *= 0.85; f.ky *= 0.85;
        var dx = f.x + lx + f.kx; var dy = f.y + ly + f.ky;
        noStroke();
        fill(0, 0, 0, 60);
        ellipse(dx, dy + 13, 18, 4);
        if (f.hurt > 0) {
            f.hurt--;
            if (f.hurt % 4 < 2) { fill(255, 60, 60, 120); ellipse(dx, dy, 30, 30); }
        }
        drawCaveCritter({type: f.type, x: dx, y: dy});
        noStroke();
        fill(60, 0, 0);
        rect(dx - 10, dy - 24, 20, 3);
        fill(80, 255, 120);
        rect(dx - 10, dy - 24, floor(20 * (f.hp / 3.0)), 3);
    }
};

// the beast decides what to do, winds up, then strikes
var updateBossAttack = function() {
    if (bossDead || bossFightLost) { return; }
    var A = bossAtk;
    var eyeX = bossX; var eyeY = bossY - 5;
    if (A.state === 0) {
        A.timer--;
        if (A.timer <= 0) {
            var n = aliveFighters();
            var r = random(1);
            var pool = [0, 2, 3, 4, 5];
            if (n > 0 && r < 0.3) { A.type = 1; }
            else { A.type = pool[floor(random(0, pool.length))]; }
            if (A.type === 3) {
                // wax rain: some drips aimed at you, some anywhere
                A.drops = [];
                for (var dq = 0; dq < 8; dq++) {
                    if (dq < 3) { A.drops.push({x: constrain(mouseX + random(-34, 34), 20, 380), y: constrain(mouseY + random(-24, 24), 90, 380)}); }
                    else { A.drops.push({x: random(25, 375), y: random(110, 370)}); }
                }
            }
            if (A.type === 5) { A.side = mouseX < bossX ? -1 : 1; }
            if (A.type === 1) {
                var alive = [];
                for (var i = 0; i < caveFighters.length; i++) { if (caveFighters[i].hp > 0) { alive.push(i); } }
                A.target = alive[floor(random(0, alive.length))];
            }
            A.state = 1; A.t = 45; A.hitDone = 0;
        }
    } else if (A.state === 1) {
        // wind-up
        A.t--;
        if (A.type === 0) { A.tx = mouseX; A.ty = mouseY; }
        if (A.t <= 0) {
            A.state = 2; A.hitDone = 0;
            if (A.type === 0) {
                A.t = 30;
                for (var b = -1; b <= 1; b++) {
                    bossBolts.push({sx: eyeX, sy: eyeY, tx: A.tx + b * 26, ty: A.ty + abs(b) * 10, t: 0});
                }
                shake(2);
            } else if (A.type === 1) {
                A.t = 30;
            } else if (A.type === 3) {
                A.t = 30;
            } else if (A.type === 4) {
                A.t = 210;
                A.ghosts = [{x: bossX - 34, y: bossY - 44}, {x: bossX + 34, y: bossY - 44}];
            } else if (A.type === 5) {
                A.t = 44;
                shake(4);
            } else {
                A.t = 50;
                shake(9);
                burst(bossX, bossY + 40, 150, 110, 90, 30, 4, 0.12);
            }
        }
    } else if (A.state === 2) {
        A.t--;
        if (A.type === 1) {
            var f = caveFighters[A.target];
            // tentacle reaches out (30 -> 20), holds, pulls back
            if (A.t === 20 && f && f.hp > 0) { hurtFighter(f, bossX, bossY); shake(3); }
        } else if (A.type === 3) {
            if (A.t === 10) {
                shake(3);
                for (var dw = 0; dw < A.drops.length; dw++) {
                    var D = A.drops[dw];
                    burst(D.x, D.y, 240, 230, 200, 6, 2, 0.1);
                    if (dist(mouseX, mouseY, D.x, D.y) < 20) { hurtPlayer(); }
                }
            }
        } else if (A.type === 4) {
            for (var gh = 0; gh < A.ghosts.length; gh++) {
                var Gh = A.ghosts[gh];
                var gdx = mouseX - Gh.x; var gdy = mouseY - Gh.y;
                var gd = max(1, sqrt(gdx * gdx + gdy * gdy));
                var gsp = 1.5 + gh * 0.3;
                Gh.x += gdx / gd * gsp + sin(frameCount * 6 + gh * 90) * 0.8;
                Gh.y += gdy / gd * gsp + cos(frameCount * 5 + gh * 90) * 0.8;
                if (A.t > 15 && gd < 16) { hurtPlayer(); }
            }
        } else if (A.type === 5) {
            var sk = 1 - A.t / 44;
            var ba = A.side < 0 ? 100 + sk * 160 : 80 - sk * 160;
            var bdx = cos(ba); var bdy = sin(ba);
            var along = (mouseX - bossX) * bdx + (mouseY - (bossY - 5)) * bdy;
            var across = abs((mouseX - bossX) * bdy - (mouseY - (bossY - 5)) * bdx);
            if (along > 0 && across < 13) { hurtPlayer(); }
        } else if (A.type === 2) {
            var ringR = (50 - A.t) * 3.4;
            for (var fi = 0; fi < caveFighters.length; fi++) {
                var ff = caveFighters[fi];
                if (ff.hp > 0 && !ff.slammed && abs(dist(ff.x, ff.y, bossX, bossY + 30) - ringR) < 10) {
                    ff.slammed = 1; hurtFighter(ff, bossX, bossY + 30);
                }
            }
            if (!A.hitDone && abs(dist(mouseX, mouseY, bossX, bossY + 30) - ringR) < 12) {
                A.hitDone = 1; hurtPlayer();
            }
        }
        if (A.t <= 0) {
            A.state = 0;
            A.timer = bossHP < bossMaxHP / 2 ? floor(random(45, 90)) : floor(random(90, 150)); // angrier when hurt
            for (var ci = 0; ci < caveFighters.length; ci++) { caveFighters[ci].slammed = 0; }
        }
    }
};

var drawBossAttackFx = function() {
    var A = bossAtk;
    var bx = bossX + bossShakeX; var by = bossY;
    // wind-up telegraphs
    if (A.state === 1) {
        var k = 1 - A.t / 45;
        noStroke();
        fill(255, 0, 40, 40 + k * 60);
        ellipse(bx, by, 110 + k * 30, 95 + k * 30);
        if (A.type === 0) {
            // reticle locked onto you
            noFill(); stroke(255, 40, 40, 120 + k * 120); strokeWeight(2);
            var rr = 40 - k * 22;
            ellipse(A.tx, A.ty, rr, rr);
            line(A.tx - rr * 0.8, A.ty, A.tx - rr * 0.3, A.ty);
            line(A.tx + rr * 0.3, A.ty, A.tx + rr * 0.8, A.ty);
            line(A.tx, A.ty - rr * 0.8, A.tx, A.ty - rr * 0.3);
            line(A.tx, A.ty + rr * 0.3, A.tx, A.ty + rr * 0.8);
            noStroke();
            fill(255, 60, 60, 200 * k);
            ellipse(bx, by - 5, 10 + k * 14, 10 + k * 14);
        } else if (A.type === 1) {
            var f = caveFighters[A.target];
            if (f && f.hp > 0 && frameCount % 6 < 4) {
                stroke(255, 40, 40, 90 + k * 120); strokeWeight(1);
                line(bx, by + 10, f.x, f.y);
                noFill(); ellipse(f.x, f.y, 34 - k * 10, 34 - k * 10);
                noStroke();
            }
        } else {
            // ground cracks + rumbling
            stroke(255, 80, 40, 80 + k * 150); strokeWeight(2);
            for (var c = 0; c < 6; c++) {
                var ca = c * 60 + 15;
                line(bx, by + 40, bx + cos(ca) * (20 + k * 50), by + 40 + sin(ca) * (8 + k * 20));
            }
            noStroke();
            if (frameCount % 4 === 0) { burst(bx + random(-50, 50), by + 45, 120, 90, 70, 1, 1.5, 0.1); }
        }
    }
    // wind-up warnings for the new attacks
    if (A.state === 1 && A.type === 3) {
        var kw = 1 - A.t / 45;
        for (var dq = 0; dq < A.drops.length; dq++) {
            noFill(); stroke(255, 230, 170, 100 + kw * 140); strokeWeight(2);
            ellipse(A.drops[dq].x, A.drops[dq].y, 40 - kw * 18, 40 - kw * 18);
            noStroke();
        }
        fill(255, 200, 80, 120 + sin(frameCount * 30) * 80);
        ellipse(bx - 22, by - 52, 10, 14); ellipse(bx + 22, by - 52, 10, 14);
    }
    if (A.state === 1 && A.type === 4) {
        fill(120, 255, 160, 60 + (1 - A.t / 45) * 150);
        ellipse(bx - 34, by - 44, 30, 30); ellipse(bx + 34, by - 44, 30, 30);
        fill(200, 255, 210, 200); textSize(10); textAlign(CENTER); text("ooOOOooo...", bx, by - 76);
    }
    if (A.state === 1 && A.type === 5) {
        fill(255, 40, 60, (frameCount % 10 < 5) ? 70 : 30);
        if (A.side < 0) { rect(0, 0, bx, 400); } else { rect(bx, 0, 400 - bx, 400); }
        fill(255, 120, 120, 220); textSize(14); textAlign(CENTER);
        text(A.side < 0 ? "<<< LASER" : "LASER >>>", A.side < 0 ? bx / 2 : (bx + 400) / 2, 120);
    }
    // wax rain falling
    if (A.state === 2 && A.type === 3) {
        var fallK = min(1, (30 - A.t) / 20);
        for (var dw = 0; dw < A.drops.length; dw++) {
            var Dd = A.drops[dw];
            if (A.t > 10) {
                var dy2 = Dd.y * fallK;
                fill(250, 240, 210); ellipse(Dd.x, dy2, 9, 12); triangle(Dd.x - 4.4, dy2 - 2, Dd.x + 4.4, dy2 - 2, Dd.x, dy2 - 11);
            } else {
                fill(245, 235, 205, A.t * 20); ellipse(Dd.x, Dd.y, 22, 8);
            }
        }
    }
    // soul ghosts chasing you
    if (A.state === 2 && A.type === 4) {
        for (var gh = 0; gh < A.ghosts.length; gh++) {
            var Gs = A.ghosts[gh];
            var ga = A.t < 15 ? A.t * 15 : 220;
            fill(120, 255, 160, ga * 0.3); ellipse(Gs.x, Gs.y, 36, 36);
            fill(190, 255, 210, ga);
            ellipse(Gs.x, Gs.y - 3, 22, 22);
            triangle(Gs.x - 11, Gs.y - 2, Gs.x + 11, Gs.y - 2, Gs.x + sin(frameCount * 12) * 5, Gs.y + 18);
            fill(20, 60, 30, ga); ellipse(Gs.x - 4, Gs.y - 5, 4, 6); ellipse(Gs.x + 4, Gs.y - 5, 4, 6);
            ellipse(Gs.x, Gs.y + 2, 5, 4);
        }
    }
    // the eye laser sweeping
    if (A.state === 2 && A.type === 5) {
        var sk2 = 1 - A.t / 44;
        var ba2 = A.side < 0 ? 100 + sk2 * 160 : 80 - sk2 * 160;
        var ex2 = bx + cos(ba2) * 600; var ey2 = by - 5 + sin(ba2) * 600;
        stroke(255, 40, 80, 120); strokeWeight(18); line(bx, by - 5, ex2, ey2);
        stroke(255, 230, 240); strokeWeight(5); line(bx, by - 5, ex2, ey2);
        noStroke(); strokeWeight(1);
    }
    // strikes
    if (A.state === 2 && A.type === 1) {
        var ft = caveFighters[A.target];
        if (ft) {
            var reach = A.t > 20 ? (30 - A.t) / 10 : (A.t > 12 ? 1 : A.t / 12);
            var ex = bx + (ft.x - bx) * reach;
            var ey = by + 10 + (ft.y - by - 10) * reach;
            var mx = (bx + ex) / 2 + sin(frameCount * 20) * 8;
            var my = (by + ey) / 2 - 20;
            stroke(150, 125, 105); strokeWeight(7);
            line(bx, by + 10, mx, my); line(mx, my, ex, ey);
            stroke(200, 180, 160); strokeWeight(3);
            line(bx, by + 10, mx, my); line(mx, my, ex, ey);
            noStroke();
            fill(230, 90, 90);
            ellipse(ex, ey, 10, 10);
        }
    }
    if (A.state === 2 && A.type === 2) {
        var ringR = (50 - A.t) * 3.4;
        noFill();
        stroke(255, 140, 60, A.t * 5); strokeWeight(6);
        ellipse(bossX, bossY + 30, ringR * 2, ringR * 1.3);
        stroke(255, 230, 180, A.t * 4); strokeWeight(2);
        ellipse(bossX, bossY + 30, ringR * 2, ringR * 1.3);
        noStroke(); strokeWeight(1);
    }
    // eye bolts
    for (var i = bossBolts.length - 1; i >= 0; i--) {
        var bl = bossBolts[i];
        bl.t++;
        var p = bl.t / 22;
        var x = bl.sx + (bl.tx - bl.sx) * p;
        var y = bl.sy + (bl.ty - bl.sy) * p;
        noStroke();
        fill(255, 40, 120, 70); ellipse(x, y, 22, 22);
        fill(255, 120, 200); ellipse(x, y, 11, 11);
        fill(255, 255, 255); ellipse(x, y, 4, 4);
        if (bl.t % 2 === 0) { burst(x, y, 255, 80, 180, 1, 0.8, 0); }
        if (bl.t >= 22) {
            burst(bl.tx, bl.ty, 255, 80, 180, 10, 2.5, 0.05);
            if (dist(mouseX, mouseY, bl.tx, bl.ty) < 20) { hurtPlayer(); }
            // helpers standing in the blast get hit too
            for (var fi = 0; fi < caveFighters.length; fi++) {
                var ff = caveFighters[fi];
                if (ff.hp > 0 && dist(ff.x, ff.y, bl.tx, bl.ty) < 16) { hurtFighter(ff, bl.tx, bl.ty); }
            }
            bossBolts.splice(i, 1);
        }
    }
    strokeWeight(1);
};

var drawFightHud = function() {
    // your slashes
    for (var i = slashes.length - 1; i >= 0; i--) {
        var sl = slashes[i];
        sl.life--;
        var k = sl.life / 12;
        stroke(255, 255, 255, 255 * k); strokeWeight(3 * k + 1);
        for (var j = -1; j <= 1; j++) {
            line(sl.x - 16 + j * 6, sl.y - 16 - j * 3, sl.x + 16 + j * 6, sl.y + 16 - j * 3);
        }
        noStroke();
        if (sl.life <= 0) { slashes.splice(i, 1); }
    }
    // damage numbers
    textAlign(CENTER);
    for (var d = dmgTexts.length - 1; d >= 0; d--) {
        var dt = dmgTexts[d];
        dt.life--; dt.y -= 0.7;
        fill(dt.r, dt.g, dt.b, dt.life * 6);
        textSize(dt.txt.length > 3 ? 9 : 12);
        text(dt.txt, dt.x, dt.y);
        if (dt.life <= 0) { dmgTexts.splice(d, 1); }
    }
    if (!bossAlive || bossDead) { return; }
    // "you" - a claw where your mouse is
    if (!bossFightLost && (playerHurtTimer === 0 || frameCount % 6 < 3)) {
        var ready = playerHitCD === 0;
        noFill();
        stroke(255, 255, 255, ready ? 200 : 90); strokeWeight(2);
        ellipse(mouseX, mouseY, 16, 16);
        line(mouseX - 4, mouseY - 5, mouseX - 1, mouseY + 5);
        line(mouseX, mouseY - 6, mouseX + 3, mouseY + 5);
        line(mouseX + 4, mouseY - 5, mouseX + 6, mouseY + 3);
        noStroke();
    }
    // hearts
    for (var h = 0; h < playerMaxHP; h++) {
        var hx = 16 + h * 18; var hy = 380;
        if (h < playerHP) { fill(255, 60, 90); } else { fill(70, 30, 50); }
        ellipse(hx - 3, hy - 2, 9, 9);
        ellipse(hx + 3, hy - 2, 9, 9);
        triangle(hx - 7.5, hy, hx + 7.5, hy, hx, hy + 8);
    }
    fill(255, 200, 220, 200);
    textSize(8); textAlign(LEFT);
    text("YOU", 8, 368);
    // helpers left
    fill(150, 255, 170, 200);
    textAlign(RIGHT);
    text("helpers: " + aliveFighters() + "/" + caveFighters.length, 392, 390);
    if (playerHurtTimer > 0) { playerHurtTimer--; }
    if (playerHitCD > 0) { playerHitCD--; }
    // knocked out
    if (bossFightLost) {
        fill(0, 0, 0, 190);
        rect(50, 150, 300, 80);
        fill(255, 110, 140);
        textSize(15); textAlign(CENTER);
        text("The beast knocked you out!", 200, 182);
        fill(220, 180, 255);
        textSize(10);
        text("(click to try again)", 200, 208);
    }
};

var drawCaveBoss = function() {
    if (!bossAlive) { return; }
    if (bossDead) {
        bossDeathTimer++;
        // explosion
        noStroke();
        for (var e = 0; e < 8; e++) {
            var ea = e * 45 + bossDeathTimer * 3;
            var er = bossDeathTimer * 2;
            fill(255, floor(random(50,200)), 0, 255 - bossDeathTimer * 3);
            ellipse(bossX + cos(ea)*er, bossY + sin(ea)*er, 15, 15);
        }
        fill(255, 200, 0, 220 - bossDeathTimer * 2);
        ellipse(bossX, bossY, bossDeathTimer * 3, bossDeathTimer * 3);
        noFill(); stroke(255, 220, 255, 200 - bossDeathTimer * 2.5); strokeWeight(3);
        ellipse(bossX, bossY, bossDeathTimer * 5, bossDeathTimer * 5);
        noStroke(); strokeWeight(1);
        if (bossDeathTimer > 80) {
            l3Portal = 1;
            bossAlive = 0;
        }
        return;
    }
    var bx = bossX + bossShakeX;
    var by = bossY;
    if (bossAtk.state === 1 && bossAtk.type === 2) { by += (1 - bossAtk.t / 45) * 8 + random(-1, 1); }
    if (bossAtk.state === 2 && bossAtk.type === 2 && bossAtk.t > 40) { by -= (bossAtk.t - 40) * 2; }
    if (bossAtk.state === 1) { bx += random(-1.5, 1.5); }
    bossShakeX = floor(bossShakeX * 0.7);
    var pulse = sin(frameCount * 0.05) * 15;
    noStroke();
    // outer glow
    fill(100, 0, 180, 60);
    ellipse(bx, by, 120 + pulse, 100 + pulse);
    // rune ring
    noFill(); stroke(180, 80, 255, 110); strokeWeight(2);
    ellipse(bx, by, 150 + pulse, 125 + pulse);
    noStroke();
    fill(220, 150, 255, 170);
    for (var rn = 0; rn < 8; rn++) {
        var ra = rn * 45 + frameCount * 1.2;
        rect(bx + cos(ra) * (75 + pulse / 2) - 2, by + sin(ra) * (62 + pulse / 2) - 4, 4, 8);
    }
    drawAltarBeast(bx, by, 1, mouseX, mouseY, bossAtk.state >= 1);
    // white flash when hit
    if (bossHitFlash > 0) {
        bossHitFlash--;
        noStroke();
        fill(255, 255, 255, bossHitFlash * 22);
        ellipse(bx, by, 95, 80);
    }
    if (bossHP < 0) { bossHP = 0; }
    // HP bar
    noStroke();
    fill(40, 0, 0);
    rect(100, 20, 200, 12);
    fill(180, 0, 255);
    rect(100, 20, floor(200 * (bossHP / bossMaxHP)), 12);
    fill(255, 255, 255, 60);
    rect(100, 20, floor(200 * (bossHP / bossMaxHP)), 4);
    fill(255, 200, 255);
    textSize(8); textAlign(CENTER);
    text("ALTAR BEAST  " + bossHP + "/" + bossMaxHP, 200, 30);
    if (bossHP <= 0 && !bossDead) { bossDead = 1; bossDeathTimer = 0; }
};

var drawL3Portal = function() {
    if (!l3Portal) { return; }
    var pr = 40 + sin(frameCount * 3) * 8;
    noStroke();
    fill(100, 0, 200, 50);
    ellipse(200, 200, pr * 3.2, pr * 3.2);
    fill(180, 0, 255, 110);
    ellipse(200, 200, pr * 2, pr * 2);
    // swirling spiral arms
    for (var arm = 0; arm < 5; arm++) {
        for (var sp = 0; sp < 14; sp++) {
            var ang = arm * 72 + sp * 22 - frameCount * 4;
            var rr = sp * pr * 0.1;
            fill(200 + sp * 4, 80 + sp * 8, 255, 210 - sp * 10);
            var dsz = 9 - sp * 0.4;
            ellipse(200 + cos(ang) * rr, 200 + sin(ang) * rr, dsz, dsz);
        }
    }
    fill(255, 230, 255, 230);
    ellipse(200, 200, pr * 0.6, pr * 0.6);
    fill(255, 255, 255, 220);
    textSize(11); textAlign(CENTER);
    text("LEVEL 4", 200, 145);
    textSize(8);
    text("(click to enter)", 200, 258);
};

var updateCaveAltar = function() {
    if (altarActivated && bossAlive && !bossDead) {
        updateBossAttack();
        drawBossAttackFx();
        drawCaveFighters();
    }
};

var level3MousePressed = function() {
    // portal click
    if (l3Portal) {
        if (dist(mouseX, mouseY, 200, 200) < 60) {
            level = 4;
            initLevel4();
        }
        return;
    }
    if (bossAlive) {
        if (bossDead) { return; }
        if (bossFightLost) { startBossFight(); return; }
        // hit the beast!
        if (playerHitCD === 0 && dist(mouseX, mouseY, bossX, bossY) < 48) {
            bossHP -= PLAYER_DMG;
            playerHitCD = 18;
            bossHitFlash = 8;
            bossShakeX = mouseX < bossX ? 7 : -7;
            slashes.push({x: mouseX, y: mouseY, life: 12});
            burst(mouseX, mouseY, 255, 150, 255, 12, 3.5, 0);
            popDmg(mouseX, mouseY - 14, "-" + PLAYER_DMG, 255, 255, 255);
            shake(2);
        }
        return;
    }
    // arrow navigation
    if (caveRoom > 0 && mouseX >= 5 && mouseX <= 45 && mouseY >= 175 && mouseY <= 225) {
        caveRoom--;
        return;
    }
    if (caveRoom < 3 && mouseX >= 355 && mouseX <= 395 && mouseY >= 175 && mouseY <= 225) {
        caveRoom++;
        if (caveRoom === 3) { altarVisible = 1; }
        return;
    }
    // click rocks to reveal
    for (var i = 0; i < caveCritters.length; i++) {
        var c = caveCritters[i];
        if (c.room !== caveRoom || c.caught || c.inPot) { continue; }
        if (c.catchType === "rock" && !c.rockRemoved) {
            if (dist(mouseX, mouseY, c.rockX + 8, c.rockY + 4) < 18) {
                c.rockRemoved = 1; return;
            }
        }
        if (c.catchType === "cage" && !c.cageOpen) {
            if (mouseX >= c.cageX && mouseX <= c.cageX + 28 &&
                mouseY >= c.cageY && mouseY <= c.cageY + 32) {
                c.cageOpen = 1; return;
            }
        }
        // click roamers / emerged critters to catch
        if ((c.catchType === "roam" || c.emerged || c.rockRemoved || c.cageOpen)) {
            if (dist(mouseX, mouseY, c.x, c.y) < 18) {
                c.caught = 1;
                draggingBtn = c;
                dragOffsetX = mouseX - c.x;
                dragOffsetY = mouseY - c.y;
                return;
            }
        }
    }
    // click pot to pick up
    if (cavePot.visible && !altarActivated &&
        dist(mouseX, mouseY, cavePot.x, cavePot.y) < 22) {
        draggingBtn = cavePot;
        dragOffsetX = mouseX - cavePot.x;
        dragOffsetY = mouseY - cavePot.y;
    }
};

var level3MouseReleased = function() {
    // drop critter into pot
    for (var i = 0; i < caveCritters.length; i++) {
        var c = caveCritters[i];
        if (draggingBtn === c && c.caught) {
            if (dist(c.x, c.y, cavePot.x, cavePot.y) < 30) {
                c.inPot = 1;
                c.caught = 1;
                cavePotContents.push(c.type);
            } else {
                // missed the pot - let it go instead of vanishing
                c.caught = 0;
            }
            break;
        }
    }
    // drop pot on altar
    if (draggingBtn === cavePot && caveRoom === 3 && !altarActivated) {
        if (dist(cavePot.x, cavePot.y, altarX, altarY) < 40) {
            if (cavePotContents.length >= l3CritterTypes.length) {
                altarActivated = 1;
                cavePot.visible = 0;
                startBossFight();
            }
        }
    }
    draggingBtn = -1;
};

var level3MouseDragged = function() {
    if (draggingBtn !== -1 && draggingBtn.x !== undefined) {
        draggingBtn.x = mouseX - dragOffsetX;
        draggingBtn.y = mouseY - dragOffsetY;
    }
};

var drawLevel3 = function() {
    drawCaveBackground();
    drawCaveArrows();
    if (!bossAlive) {
        drawCaveCritters();
        drawCavePot();
        drawCaveAltar();
    }
    if (bossAlive) {
        drawCaveBoss();
        updateCaveAltar(); // fighters actually fight now
    }
    drawFightHud();
    drawL3Portal();
    if (l3Portal === 2) {
        noStroke();
        fill(0, 0, 0, 180);
        rect(60, 140, 280, 80);
        fill(220, 180, 255);
        textSize(16); textAlign(CENTER);
        text("LEVEL 4", 200, 175);
        fill(180, 140, 220);
        textSize(10);
        text("Coming Soon...", 200, 200);
    }
    // how many critters caught label
    if (!bossAlive && !altarActivated) {
        var caught = 0;
        for (var ci = 0; ci < caveCritters.length; ci++) {
            if (caveCritters[ci].inPot) { caught++; }
        }
        noStroke();
        fill(150, 100, 200, 180);
        textSize(8); textAlign(RIGHT);
        text("in pot: " + caught + "/" + l3CritterTypes.length, 392, 15);
    }
};

RainbowStar.prototype.draw = function() {
    var ratio = this.life / this.maxLife;
    noStroke();
    fill(this.r, this.g, this.b, ratio * 220);
    ellipse(this.x, this.y, this.size * ratio, this.size * ratio);
    fill(255, 255, 255, ratio * 120);
    ellipse(this.x, this.y, this.size * ratio * 0.4, this.size * ratio * 0.4);
};

var MoonberryStar = function(x, y) {
    this.x = x; this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-4, -1);
    this.life = random(40, 80);
    this.maxLife = this.life;
    this.size = random(4, 10);
};
MoonberryStar.prototype.update = function() {
    this.x += this.vx; this.y += this.vy;
    this.vy += 0.05; this.life--;
};
MoonberryStar.prototype.draw = function() {
    var ratio = this.life / this.maxLife;
    noStroke();
    fill(180, 100, 255, ratio * 200);
    ellipse(this.x, this.y, this.size * ratio, this.size * ratio);
    fill(255, 180, 255, ratio * 150);
    ellipse(this.x, this.y, this.size * ratio * 0.5, this.size * ratio * 0.5);
};

var squirrel = {x:-40, y:288, alive:1, burning:0, burnTimer:0, arrived:0};
var squirrelActive = 0;
var squirrelDelay = 0;
var squirrelStoleNut = 0;
var meat = {x:0, y:0, visible:0, width:20, height:16};
var meatDragging = 0;
var wolfMessage = "";
var wolfMessageTimer = 0;

var FireParticle = function(x, y) {
    this.x = x; this.y = y;
    this.vx = random(-1.5, 1.5);
    this.vy = random(-3, -1);
    this.life = random(15, 30);
    this.maxLife = this.life;
};
FireParticle.prototype.update = function() {
    this.x += this.vx; this.y += this.vy;
    this.vy -= 0.05; this.life--;
};
FireParticle.prototype.draw = function() {
    var ratio = this.life / this.maxLife;
    var g = floor(ratio * 180);
    noStroke();
    fill(255, g, 0, this.life * 2);
    ellipse(this.x, this.y, 6 * ratio + 1, 6 * ratio + 1);
    strokeWeight(2);
    stroke(255, g + 60, 40, this.life * 6);
    point(this.x, this.y);
};

var drawCloud = function() {
    noStroke();
    fill(70, 70, 76);
    ellipse(cloud.x, cloud.y + 14, 104, 40);
    fill(105, 105, 105);
    ellipse(cloud.x, cloud.y, 50, 50);
    ellipse(cloud.x - 33, cloud.y, 50, 50);
    ellipse(cloud.x + 31, cloud.y, 50, 50);
    ellipse(cloud.x, cloud.y + 7, 87, 50);
    fill(135, 135, 140);
    ellipse(cloud.x - 5, cloud.y - 8, 34, 26);
    ellipse(cloud.x - 36, cloud.y - 4, 28, 22);
    ellipse(cloud.x + 28, cloud.y - 6, 30, 24);
    fill(165, 165, 172, 150);
    ellipse(cloud.x - 8, cloud.y - 14, 16, 9);
};
var drawSeed = function() {
    if (!seedBuried) {
        noStroke();
        fill(0, 0, 0, 50);
        ellipse(seed.x + 1, seed.y + 7, 10, 3);
        fill(82, 45, 0);
        ellipse(seed.x, seed.y, seed.width, seed.height);
        fill(115, 70, 20);
        ellipse(seed.x - 2, seed.y - 3, 3, 6);
        stroke(60, 30, 0); strokeWeight(1);
        line(seed.x + 1, seed.y - 6, seed.x + 1, seed.y + 6);
        noStroke();
    }
};
var drawShovel = function() {
    stroke(79, 57, 0); strokeWeight(4);
    line(shovel.x, shovel.y, shovel.x + 15, shovel.y);
    stroke(115, 85, 25); strokeWeight(1.5);
    line(shovel.x, shovel.y - 1, shovel.x + 14, shovel.y - 1);
    noStroke();
    fill(55, 40, 0);
    rect(shovel.x - 4, shovel.y - 4, 5, 8);
    fill(204, 204, 204);
    arc(shovel.x + 16, shovel.y, 30, 24, -90, 90);
    fill(150, 150, 158);
    arc(shovel.x + 16, shovel.y + 2, 24, 16, 0, 90);
    fill(240, 240, 245);
    arc(shovel.x + 16, shovel.y - 2, 20, 14, -90, 0);
    noStroke(); strokeWeight(1);
};
var drawHole = function() {
    if (holeExists) {
        noStroke();
        if (holeFilled) {
            fill(71, 33, 0);
            ellipse(holeX, holeY, 30, 12);
            fill(95, 50, 10);
            ellipse(holeX - 5, holeY - 2, 8, 4);
            ellipse(holeX + 6, holeY, 6, 3);
        } else {
            fill(90, 45, 5);
            ellipse(holeX, holeY - 1, 34, 14);
            fill(50, 25, 0);
            ellipse(holeX, holeY, 30, 12);
            fill(30, 14, 0);
            ellipse(holeX, holeY + 1, 20, 7);
        }
    }
};
var drawPuddle = function() {
    if (!puddle.visible) { return; }
    if (puddleSize < 1) { puddleSize += 0.005; }
    noStroke();
    fill(60, 120, 200, 160);
    ellipse(puddle.x + puddle.width * 0.5, puddle.y, puddle.width * puddleSize, puddle.height * puddleSize);
    fill(160, 200, 255, 90);
    ellipse(puddle.x + puddle.width * 0.38, puddle.y - 2, puddle.width * puddleSize * 0.35, puddle.height * puddleSize * 0.25);
    stroke(100, 160, 255, 60); strokeWeight(1); noFill();
    ellipse(puddle.x + puddle.width * 0.5, puddle.y, puddle.width * puddleSize + 6, puddle.height * puddleSize + 4);
    // slow ripple
    var rp = (frameCount % 120) / 120;
    stroke(180, 210, 255, 90 * (1 - rp));
    ellipse(puddle.x + puddle.width * 0.6, puddle.y, 30 * rp * puddleSize, 8 * rp * puddleSize);
    noStroke();
};
var drawFishingLine = function() {
    if (!fishingLine.active) { return; }
    stroke(200, 200, 200); strokeWeight(1);
    line(fishingLine.x, 0, fishingLine.x, fishingLine.hookY);
    noFill(); stroke(180, 180, 180);
    arc(fishingLine.x, fishingLine.hookY, 8, 8, 0, 180);
    // bobber
    noStroke();
    fill(230, 40, 40);
    ellipse(fishingLine.x, fishingLine.hookY - 14, 6, 6);
    fill(255);
    ellipse(fishingLine.x, fishingLine.hookY - 16, 6, 3);
    if (fishOnHook) {
        var wiggle = sin(frameCount * 0.3) * 3;
        noStroke(); fill(100, 180, 100);
        ellipse(fishingLine.x + wiggle, fishingLine.hookY - 4, 18, 8);
        fill(80, 150, 80);
        triangle(fishingLine.x + 9 + wiggle, fishingLine.hookY - 4, fishingLine.x + 14 + wiggle, fishingLine.hookY - 8, fishingLine.x + 14 + wiggle, fishingLine.hookY);
        if (frameCount % 8 === 0) { burst(fishingLine.x, fishingLine.hookY, 150, 200, 255, 2, 1.5, 0.12); }
    }
};
// a fish facing left; cooked = 1 gives it grill marks
var drawFishShape = function(x, y, cooked) {
    var br = cooked ? 200 : 95; var bg = cooked ? 125 : 175; var bb = cooked ? 45 : 110;
    noStroke();
    // forked tail
    fill(br * 0.8, bg * 0.8, bb * 0.8);
    triangle(x + 10, y, x + 19, y - 7, x + 15, y);
    triangle(x + 10, y, x + 19, y + 7, x + 15, y);
    // fins
    triangle(x - 3, y - 5, x + 3, y - 10, x + 7, y - 5);
    triangle(x - 2, y + 4, x + 3, y + 8, x + 4, y + 3);
    // body + belly
    fill(br, bg, bb); ellipse(x, y, 25, 11);
    fill(min(255, br + 60), min(255, bg + 45), min(255, bb + 60)); ellipse(x - 1, y + 2.5, 18, 4);
    // scales
    noFill(); stroke(br * 0.75, bg * 0.75, bb * 0.75); strokeWeight(0.6);
    for (var sc = 0; sc < 4; sc++) {
        arc(x - 1 + sc * 3.5, y - 1.5, 4, 4, 90, 270);
        arc(x + 1 + sc * 3.5, y + 1, 4, 4, 90, 270);
    }
    // gill
    stroke(br * 0.6, bg * 0.6, bb * 0.6); strokeWeight(0.9);
    arc(x - 5, y, 5, 8, -70, 70);
    noStroke();
    if (cooked) {
        stroke(110, 55, 10); strokeWeight(1.3);
        line(x - 3, y - 4, x, y + 4); line(x + 3, y - 4, x + 6, y + 4);
        noStroke();
    }
    // eye
    fill(255); ellipse(x - 8, y - 1.5, 4, 4);
    fill(cooked ? 80 : 0, cooked ? 40 : 0, 0); ellipse(x - 8.3, y - 1.5, 2.2, 2.2);
    fill(255); ellipse(x - 8.7, y - 2.1, 0.8, 0.8);
    // mouth
    fill(br * 0.6, bg * 0.6, bb * 0.6); ellipse(x - 12, y + 0.5, 2, 1.5);
};
var drawRawFish = function() {
    if (!rawFish.visible) { return; }
    drawFishShape(rawFish.x, rawFish.y, 0);
};
var drawCookedFish = function() {
    if (!cookedFish.visible) { return; }
    drawFishShape(cookedFish.x, cookedFish.y, 1);
    stroke(180, 180, 180, 80); strokeWeight(1);
    line(cookedFish.x - 4, cookedFish.y - 7, cookedFish.x - 6, cookedFish.y - 13);
    line(cookedFish.x + 2, cookedFish.y - 7, cookedFish.x + 4, cookedFish.y - 13);
    noStroke();
};
var drawFrog = function() {
    if (!frog.visible) { return; }
    var fx = frog.x; var fy = frog.y;
    if (frogEmerging) {
        var prog = min(1, frogEmergeTimer / 60.0);
        fy = puddle.y + 4 - prog * (puddle.y + 4 - 285);
    }
    noStroke();
    var gulp = sin(frameCount * 10) * 1.2;
    // folded back leg + webbed foot
    fill(45, 140, 45); ellipse(fx - 7, fy + 3, 13, 9);
    fill(40, 125, 40); ellipse(fx - 12, fy + 7, 8, 3); ellipse(fx - 15, fy + 6, 3, 2); ellipse(fx - 14, fy + 8, 3, 2);
    // body with spots
    fill(60, 160, 60); ellipse(fx, fy, 20, 14);
    fill(40, 120, 40); ellipse(fx - 4, fy - 3, 4, 3); ellipse(fx + 1, fy - 5, 3, 2); ellipse(fx - 6, fy + 1, 3, 2);
    fill(170, 220, 120); ellipse(fx + 2, fy + 4, 13, 6);
    // front leg + toes
    fill(50, 150, 50); rect(fx + 5, fy + 2, 3, 6, 1);
    fill(45, 135, 45); ellipse(fx + 5, fy + 8.5, 3, 2); ellipse(fx + 7.5, fy + 9, 3, 2); ellipse(fx + 9.5, fy + 8.5, 3, 2);
    // throat
    fill(190, 230, 140); ellipse(fx + 10, fy + 1, 7 + gulp, 4 + gulp * 0.5);
    // head + eye bulges
    fill(70, 180, 70); ellipse(fx + 10, fy - 3, 13, 10);
    ellipse(fx + 7.5, fy - 7, 7, 7); ellipse(fx + 13.5, fy - 7, 7, 7);
    fill(255, 225, 40); ellipse(fx + 7.5, fy - 7.5, 5, 5); ellipse(fx + 13.5, fy - 7.5, 5, 5);
    fill(0); ellipse(fx + 7.5, fy - 7.5, 3.4, 1.8); ellipse(fx + 13.5, fy - 7.5, 3.4, 1.8);
    fill(255); ellipse(fx + 7, fy - 8.3, 1, 1); ellipse(fx + 13, fy - 8.3, 1, 1);
    // mouth + nostrils
    stroke(30, 95, 30); strokeWeight(1); noFill();
    arc(fx + 10, fy - 2, 12, 5, 10, 170);
    noStroke();
    fill(30, 95, 30); ellipse(fx + 14.5, fy - 4, 1, 1); ellipse(fx + 16, fy - 3.5, 1, 1);
};
var drawCookedFrog = function() {
    if (!cookedFrog.visible) { return; }
    noStroke(); fill(160, 100, 40);
    ellipse(cookedFrog.x, cookedFrog.y, 18, 10);
    fill(130, 80, 20); ellipse(cookedFrog.x + 9, cookedFrog.y - 2, 10, 8);
    fill(110, 60, 10);
    ellipse(cookedFrog.x - 6, cookedFrog.y + 3, 7, 4);
    ellipse(cookedFrog.x + 3, cookedFrog.y + 4, 7, 4);
    stroke(180, 180, 180, 80); strokeWeight(1);
    line(cookedFrog.x, cookedFrog.y - 6, cookedFrog.x - 2, cookedFrog.y - 12);
    line(cookedFrog.x + 5, cookedFrog.y - 6, cookedFrog.x + 7, cookedFrog.y - 12);
    noStroke();
};
var drawNutPaste = function() {
    if (nutPaste.visible) {
        noStroke(); fill(120, 80, 20);
        ellipse(nutPaste.x + 7, nutPaste.y, 20, 10);
        fill(100, 60, 10);
        ellipse(nutPaste.x + 4, nutPaste.y - 2, 8, 6);
        ellipse(nutPaste.x + 11, nutPaste.y - 2, 8, 6);
        stroke(80, 50, 5); strokeWeight(1);
        line(nutPaste.x + 3, nutPaste.y, nutPaste.x + 6, nutPaste.y - 3);
        line(nutPaste.x + 8, nutPaste.y + 1, nutPaste.x + 11, nutPaste.y - 2);
        noStroke();
    }
    if (smokedPaste.visible) {
        noStroke(); fill(50, 30, 5);
        ellipse(smokedPaste.x + 7, smokedPaste.y, 20, 10);
        fill(35, 20, 2);
        ellipse(smokedPaste.x + 4, smokedPaste.y - 2, 8, 6);
        ellipse(smokedPaste.x + 11, smokedPaste.y - 2, 8, 6);
        stroke(180, 180, 180, 80); strokeWeight(1);
        line(smokedPaste.x + 4, smokedPaste.y - 6, smokedPaste.x + 2, smokedPaste.y - 12);
        line(smokedPaste.x + 10, smokedPaste.y - 6, smokedPaste.x + 12, smokedPaste.y - 12);
        noStroke();
    }
};
var drawMoonstone = function() {
    if (!moonstone.visible) { return; }
    moonstonePulse += 0.06;
    var glow = 180 + floor(sin(moonstonePulse) * 60);
    noStroke();
    fill(glow, glow, 255, 50); ellipse(moonstone.x + 7, moonstone.y, 22, 22);
    fill(glow, glow, 255); ellipse(moonstone.x + 7, moonstone.y, 12, 12);
    fill(255, 255, 255, 200); ellipse(moonstone.x + 4, moonstone.y - 3, 4, 4);
    stroke(200, 200, 255, 100); strokeWeight(1);
    line(moonstone.x + 7, moonstone.y - 8, moonstone.x + 7, moonstone.y - 14);
    line(moonstone.x + 3, moonstone.y - 5, moonstone.x - 1, moonstone.y - 9);
    line(moonstone.x + 11, moonstone.y - 5, moonstone.x + 15, moonstone.y - 9);
    noStroke();
};
var drawCrystalCandy = function() {
    if (!crystalCandy.visible) { return; }
    noStroke();
    fill(180, 255, 255, 200);
    triangle(crystalCandy.x + 7, crystalCandy.y - 8, crystalCandy.x, crystalCandy.y + 6, crystalCandy.x + 14, crystalCandy.y + 6);
    fill(100, 220, 255, 150);
    triangle(crystalCandy.x + 7, crystalCandy.y - 4, crystalCandy.x + 3, crystalCandy.y + 6, crystalCandy.x + 11, crystalCandy.y + 6);
    fill(255, 255, 255, 180); ellipse(crystalCandy.x + 5, crystalCandy.y - 2, 3, 3);
    stroke(180, 255, 255, 80); strokeWeight(1);
    line(crystalCandy.x + 7, crystalCandy.y - 10, crystalCandy.x + 9, crystalCandy.y - 14);
    noStroke();
};
var drawEclipseBerry = function() {
    if (!eclipseBerry.visible) { return; }
    noStroke();
    fill(100, 0, 150, 60); ellipse(eclipseBerry.x + 6, eclipseBerry.y, 20, 20);
    fill(80, 0, 20); ellipse(eclipseBerry.x + 6, eclipseBerry.y, 12, 12);
    stroke(255, 140, 0, 150); strokeWeight(2); noFill();
    ellipse(eclipseBerry.x + 6, eclipseBerry.y, 16, 16);
    noStroke();
    fill(255, 200, 0, 100); ellipse(eclipseBerry.x + 3, eclipseBerry.y - 3, 3, 3);
    stroke(40, 20, 0); strokeWeight(1);
    line(eclipseBerry.x + 6, eclipseBerry.y - 6, eclipseBerry.x + 8, eclipseBerry.y - 11);
    noStroke();
};
var drawRainbowStars = function() {
    if (rainbowStarTimer > 0) {
        rainbowStarTimer--;
        for (var s = 0; s < 3; s++) {
            rainbowStars.push(new RainbowStar(200 + random(-40, 40), 160 + random(-30, 30)));
        }
    }
    for (var i = 0; i < rainbowStars.length; i++) {
        var st = rainbowStars[i];
        st.update(); st.draw();
        if (st.life <= 0) { rainbowStars.splice(i, 1); i--; }
    }
};
var drawEclipse = function() {
    if (!eclipseActive) { return; }
    noStroke();
    fill(255, 120, 0, 30); ellipse(moon.x, moon.y, 80, 80);
    fill(255, 160, 0, 20); ellipse(moon.x, moon.y, 100, 100);
};
var drawMushrooms = function() {
    for (var i = 0; i < mushrooms.length; i++) {
        var m = mushrooms[i];
        if (m.growth <= 0) { continue; }
        var s = m.growth / 100;
        mushroomGlowPulse += 0.02;
        var glow = 150 + floor(sin(mushroomGlowPulse + i) * 50);
        noStroke();
        fill(100, glow, 255, 40); ellipse(m.x + 8 * s, m.y, 28 * s, 20 * s);
        fill(220, 220, 180); rect(m.x + 4 * s, m.y - 4 * s, 8 * s, 12 * s);
        fill(100, glow, 255); ellipse(m.x + 8 * s, m.y - 6 * s, 20 * s, 14 * s);
        fill(70, glow - 40, 220); ellipse(m.x + 8 * s, m.y - 2 * s, 18 * s, 4 * s);
        if (m.growth > 60) {
            fill(180, 255, 255, 180);
            ellipse(m.x + 5 * s, m.y - 7 * s, 4 * s, 4 * s);
            ellipse(m.x + 11 * s, m.y - 5 * s, 3 * s, 3 * s);
        }
    }
    if (cookedMushroom.visible) {
        noStroke();
        fill(160, 140, 100); rect(cookedMushroom.x + 4, cookedMushroom.y - 4, 8, 12);
        fill(140, 90, 20); ellipse(cookedMushroom.x + 8, cookedMushroom.y - 6, 20, 14);
        stroke(180, 180, 180, 80); strokeWeight(1);
        line(cookedMushroom.x + 8, cookedMushroom.y - 13, cookedMushroom.x + 6, cookedMushroom.y - 19);
        line(cookedMushroom.x + 10, cookedMushroom.y - 13, cookedMushroom.x + 12, cookedMushroom.y - 19);
        noStroke();
    }
};
var drawCursedApple = function() {
    if (!cursedApple.visible || cursedAppleGrowth <= 0) { return; }
    var s = cursedAppleGrowth / 100;
    cursedApplePulse += 0.1;
    var glow = 150 + floor(sin(cursedApplePulse) * 60);
    noStroke();
    fill(180, 0, glow, 50); ellipse(cursedApple.x + 8 * s, cursedApple.y + 6 * s, 30 * s, 30 * s);
    fill(180, 0, glow); ellipse(cursedApple.x + 8 * s, cursedApple.y + 8 * s, 18 * s, 18 * s);
    fill(160, 0, glow - 20); ellipse(cursedApple.x + 8 * s, cursedApple.y + 2 * s, 8 * s, 8 * s);
    stroke(80, 50, 10); strokeWeight(2 * s);
    line(cursedApple.x + 8 * s, cursedApple.y + 1 * s, cursedApple.x + 10 * s, cursedApple.y - 5 * s);
    noStroke();
    fill(0, 140, 0); ellipse(cursedApple.x + 12 * s, cursedApple.y - 4 * s, 8 * s, 5 * s);
    fill(255, 180, 255, 180); ellipse(cursedApple.x + 5 * s, cursedApple.y + 5 * s, 4 * s, 4 * s);
    // tiny skull mark
    fill(40, 0, 60, 160);
    ellipse(cursedApple.x + 9 * s, cursedApple.y + 9 * s, 5 * s, 4 * s);
    noStroke();
};
var drawMoonberryBush = function() {
    if (gameStage < 7 || dayTime || bushGrowth <= 0) { return; }
    var bx = 340; var by = 290;
    var s = bushGrowth / 100;
    noStroke();
    fill(20, 80, 20); ellipse(bx, by, 50 * s, 30 * s);
    ellipse(bx - 15 * s, by + 5 * s, 30 * s, 20 * s);
    ellipse(bx + 15 * s, by + 5 * s, 30 * s, 20 * s);
    fill(15, 60, 15); ellipse(bx, by + 8 * s, 40 * s, 18 * s);
    fill(40, 110, 40, 150); ellipse(bx - 8 * s, by - 6 * s, 20 * s, 10 * s);
    if (bushGrowth >= 80) {
        moonberryPulse += 0.07;
        for (var i = 0; i < moonberries.length; i++) {
            var b = moonberries[i];
            if (!b.visible) { continue; }
            var glow = 180 + floor(sin(moonberryPulse + i) * 50);
            noStroke();
            fill(180, 60, glow, 50); ellipse(b.x, b.y, 20, 20);
            fill(120, 20, glow); ellipse(b.x, b.y, 12, 12);
            fill(220, 180, 255, 180); ellipse(b.x - 2, b.y - 3, 4, 4);
            stroke(60, 120, 60); strokeWeight(1);
            line(b.x, b.y - 6, b.x + 2, b.y - 10);
            noStroke();
        }
    }
    if (moonberryAnimTimer > 0) {
        moonberryAnimTimer--;
        moonberryStars.push(new MoonberryStar(200 + random(-30, 30), 150 + random(-20, 20)));
    }
    for (var j = 0; j < moonberryStars.length; j++) {
        var st = moonberryStars[j];
        st.update(); st.draw();
        if (st.life <= 0) { moonberryStars.splice(j, 1); j--; }
    }
};
var drawL1Leaves = function() {
    if (leavesOnFire) {
        leafFireParticles.push(new FireParticle(leaves.x + random(leaves.width), leaves.y + random(leaves.height * 0.5)));
        leafFireParticles.push(new FireParticle(leaves.x + random(leaves.width), leaves.y + random(leaves.height * 0.5)));
        // warm glow around the fire
        noStroke();
        var fgl = 40 + sin(frameCount * 9) * 12;
        fill(255, 140, 30, fgl);
        ellipse(leaves.x + 20, leaves.y + 8, 80, 60);
        for (var i = 0; i < leafFireParticles.length; i++) {
            var p = leafFireParticles[i];
            p.update(); p.draw();
            if (p.life <= 0) { leafFireParticles.splice(i, 1); i--; }
        }
        strokeWeight(1); noStroke();
        fill(40, 20, 0);
        ellipse(leaves.x + 20, leaves.y + 10, 40, 25);
        ellipse(leaves.x + 10, leaves.y + 15, 25, 20);
        ellipse(leaves.x + 30, leaves.y + 15, 25, 20);
        fill(255, 90, 0, 120 + sin(frameCount * 11) * 60);
        ellipse(leaves.x + 16, leaves.y + 12, 6, 4);
        ellipse(leaves.x + 27, leaves.y + 16, 5, 3);
    } else {
        noStroke(); fill(34, 139, 34);
        ellipse(leaves.x + 20, leaves.y + 10, 40, 25);
        fill(27, 120, 27);
        ellipse(leaves.x + 10, leaves.y + 15, 25, 20);
        ellipse(leaves.x + 30, leaves.y + 15, 25, 20);
        fill(70, 175, 60, 150);
        ellipse(leaves.x + 15, leaves.y + 5, 14, 8);
    }
};
var drawNuts = function() {
    noStroke();
    for (var i = 0; i < nuts.length; i++) {
        var n = nuts[i];
        var s = min(1, nutGrowth / 100);
        fill(139, 90, 20); ellipse(n.x, n.y, 10 * s, 12 * s);
        fill(175, 120, 45); ellipse(n.x - 2 * s, n.y - 1 * s, 3 * s, 5 * s);
        fill(100, 60, 10); rect(n.x - 5 * s, n.y - 7 * s, 10 * s, 5 * s);
    }
    if (cookedNut.visible) {
        fill(60, 35, 5); ellipse(cookedNut.x, cookedNut.y, 10, 12);
        fill(40, 20, 0); rect(cookedNut.x - 5, cookedNut.y - 7, 10, 5);
        stroke(180, 180, 180, 80); strokeWeight(1);
        line(cookedNut.x, cookedNut.y - 8, cookedNut.x - 2, cookedNut.y - 14);
        line(cookedNut.x + 2, cookedNut.y - 8, cookedNut.x + 4, cookedNut.y - 14);
        noStroke();
    }
};
var drawSquirrel = function() {
    if (!squirrelActive) { return; }
    var sx = squirrel.x; var sy = squirrel.y;
    if (!squirrel.alive) { return; }
    if (squirrel.burning) {
        squirrelFireParticles.push(new FireParticle(sx + random(-8, 8), sy + random(-10, 0)));
        for (var i = 0; i < squirrelFireParticles.length; i++) {
            var p = squirrelFireParticles[i];
            p.update(); p.draw();
            if (p.life <= 0) { squirrelFireParticles.splice(i, 1); i--; }
        }
        strokeWeight(1);
    }
    noStroke();
    var tw = sin(frameCount * 6) * 2;
    // big bushy tail, curled up behind
    fill(150, 95, 45); ellipse(sx - 10, sy - 9, 16, 26); ellipse(sx - 6 + tw * 0.5, sy - 22, 15, 13);
    fill(180, 125, 70); ellipse(sx - 11, sy - 10, 8, 18); ellipse(sx - 6 + tw * 0.5, sy - 23, 8, 6);
    stroke(200, 150, 100); strokeWeight(1);
    line(sx - 17, sy - 16, sx - 20, sy - 19); line(sx - 18, sy - 7, sx - 21, sy - 8); line(sx - 11, sy - 28, sx - 13, sy - 31);
    noStroke();
    // body, belly, haunch
    fill(150, 95, 45); ellipse(sx, sy, 18, 15);
    fill(230, 195, 145); ellipse(sx + 4, sy + 3, 9, 9);
    fill(135, 85, 40); ellipse(sx - 3, sy + 4, 11, 9);
    fill(110, 70, 35); ellipse(sx - 1, sy + 8, 9, 3); ellipse(sx + 6, sy + 8, 6, 3);
    // little front paws
    fill(135, 85, 40); ellipse(sx + 8, sy + 1, 4, 6);
    // head
    fill(150, 95, 45); ellipse(sx + 10, sy - 6, 13, 12);
    fill(230, 195, 145); ellipse(sx + 14, sy - 3, 8, 6);
    triangle(sx + 6, sy - 10, sx + 8, sy - 18, sx + 11, sy - 11);
    fill(150, 95, 45); triangle(sx + 6.5, sy - 10, sx + 8, sy - 19, sx + 10, sy - 11);
    fill(230, 160, 150); triangle(sx + 7.5, sy - 11, sx + 8.3, sy - 16, sx + 9.5, sy - 11);
    fill(0); ellipse(sx + 12, sy - 8, 3.6, 3.6);
    fill(255); ellipse(sx + 12.7, sy - 8.7, 1.2, 1.2);
    fill(60, 30, 20); ellipse(sx + 17.5, sy - 4.5, 2.6, 2);
    stroke(80, 50, 30, 150); strokeWeight(0.6);
    line(sx + 17, sy - 3, sx + 22, sy - 4); line(sx + 17, sy - 2.5, sx + 22, sy - 1);
    noStroke();
};
var drawMeat = function() {
    if (!meat.visible) { return; }
    noStroke(); fill(180, 60, 60);
    ellipse(meat.x, meat.y, 20, 10);
    fill(160, 40, 40);
    ellipse(meat.x - 5, meat.y - 3, 10, 8);
    ellipse(meat.x + 5, meat.y - 3, 10, 8);
    fill(240, 225, 210);
    ellipse(meat.x + 11, meat.y, 5, 4);
    fill(230, 140, 140, 150);
    ellipse(meat.x - 3, meat.y - 1, 6, 3);
};
var drawTree = function() {
    if (treeGrowth <= 0) { return; }
    var trunkH = treeGrowth * 0.8;
    var trunkTop = holeY - trunkH;
    noStroke(); fill(101, 67, 33);
    rect(holeX - 4, trunkTop, 8, trunkH);
    fill(80, 52, 24);
    rect(holeX - 4, trunkTop, 3, trunkH);
    stroke(70, 45, 20, 150); strokeWeight(1);
    for (var bk = trunkTop + 8; bk < holeY - 4; bk += 11) {
        line(holeX - 1, bk, holeX + 2, bk + 4);
    }
    noStroke();
    if (treeGrowth > 60) {
        fill(101, 67, 33);
        triangle(holeX - 4, holeY - 6, holeX - 11, holeY + 1, holeX - 2, holeY);
        triangle(holeX + 4, holeY - 6, holeX + 11, holeY + 1, holeX + 2, holeY);
    }
    if (treeGrowth > 40) {
        var leafSize = (treeGrowth - 40) * 1.5;
        fill(24, 110, 24);
        ellipse(holeX + 2, trunkTop + leafSize * 0.15, leafSize * 1.05, leafSize * 0.9);
        fill(34, 139, 34);
        ellipse(holeX, trunkTop, leafSize, leafSize);
        ellipse(holeX - leafSize * 0.35, trunkTop + leafSize * 0.2, leafSize * 0.7, leafSize * 0.7);
        ellipse(holeX + leafSize * 0.35, trunkTop + leafSize * 0.2, leafSize * 0.7, leafSize * 0.7);
        fill(70, 175, 60, 170);
        ellipse(holeX - leafSize * 0.15, trunkTop - leafSize * 0.18, leafSize * 0.45, leafSize * 0.35);
        ellipse(holeX + leafSize * 0.33, trunkTop + leafSize * 0.08, leafSize * 0.28, leafSize * 0.22);
        if (treeGrown) {
            for (var i = 0; i < nuts.length; i++) {
                var n = nuts[i];
                if (!n.onGround && draggingBtn !== n) {
                    n.x = holeX + n.offsetX;
                    n.y = trunkTop + n.offsetY;
                }
            }
            if (gameStage >= 6 && !dayTime && cursedApple.visible && draggingBtn !== cursedApple) {
                cursedApple.x = holeX + 18;
                cursedApple.y = trunkTop + 5;
            }
        }
        if (draggingBtn !== leaves && !leavesDetached) {
            leaves.x = holeX - 20;
            leaves.y = trunkTop - 15;
            leavesOnTree = true;
        }
        drawL1Leaves();
    }
    if (arrowVisible) {
        var ax = holeX; var ay = trunkTop - 20 + sin(frameCount * 5) * 3;
        noStroke();
        fill(255, 220, 0, 60);
        ellipse(ax, ay - 2, 30, 30);
        fill(255, 220, 0); stroke(0); strokeWeight(1);
        triangle(ax, ay - 14, ax - 10, ay, ax + 10, ay);
        rect(ax - 4, ay, 8, 10);
        strokeWeight(1);
    }
};
var isSunBehindMoon = function() {
    var dx = sun.x - moon.x; var dy = sun.y - moon.y;
    return (dx * dx + dy * dy) < 30 * 30;
};
var updateEclipse = function() {
    if (gameStage < 10 || dayTime) { eclipseActive = 0; eclipseBerry.visible = 0; return; }
    if (isSunBehindMoon()) {
        eclipseTimer++;
        if (eclipseTimer > 30) {
            eclipseActive = 1; eclipseBerry.visible = 1;
            if (eclipseBerry.x === 0) { eclipseBerry.x = random(50, 300); eclipseBerry.y = 287; }
        }
    } else {
        eclipseTimer = 0; eclipseActive = 0;
        if (!eclipseBerry.visible) { eclipseBerry.x = 0; }
        if (draggingBtn !== eclipseBerry) { eclipseBerry.visible = 0; eclipseBerry.x = 0; }
    }
};
var updateMoonstoneSpawn = function() {
    if (gameStage < 9 || dayTime || moonstoneSpawned) { return; }
    var dx = moon.x - 200;
    if (abs(dx) < 40 && moon.y < 60) {
        moonstoneSpawned = 1; moonstone.visible = 1;
        moonstone.x = floor(random(30, 330)); moonstone.y = 287;
        burst(moonstone.x + 7, moonstone.y, 200, 200, 255, 20, 2.5, 0.05);
    }
};
var updateFrog = function() {
    if (frogEmerging) {
        frogEmergeTimer++;
        frog.y = puddle.y + 4 - (frogEmergeTimer / 60.0) * (puddle.y + 4 - 285);
        if (frogEmergeTimer >= 60) { frogEmerging = 0; frog.y = 285; frogSpawned = 1; }
        return;
    }
    if (!frog.visible || frog.caught) { return; }
    frogHopTimer++;
    if (catchWindowOpen) {
        catchTimer--;
        if (catchTimer <= 0) {
            catchWindowOpen = 0;
            frog.x = puddle.x + puddle.width * 0.5 + random(-30, 30);
            frog.x = max(20, min(380, frog.x));
        }
    }
    if (frogHopTimer >= frogHopInterval) {
        frogHopTimer = 0;
        frogHopInterval = floor(random(120, 200));
        frog.x = puddle.x + puddle.width * 0.5 + random(-40, 40);
        frog.x = max(20, min(380, frog.x));
        catchWindowOpen = 1; catchTimer = 120;
        burst(frog.x, 292, 120, 170, 255, 5, 1.5, 0.12);
    }
};
var updateSquirrel = function() {
    if (!squirrelActive || !squirrel.alive) { return; }
    if (squirrel.burning) {
        squirrel.burnTimer--;
        if (squirrel.burnTimer <= 0) {
            squirrel.alive = 0;
            meat.visible = 1; meat.x = squirrel.x; meat.y = squirrel.y;
            burst(squirrel.x, squirrel.y, 90, 90, 90, 18, 2, -0.04);
        }
        return;
    }
    if (gameStage === 3 && !squirrelStoleNut && nuts.length > 0 && nutGrowth >= 100) {
        var targetNut = nuts[0];
        if (squirrel.x < targetNut.x - 2) { squirrel.x += 1; }
        else if (squirrel.x > targetNut.x + 2) { squirrel.x -= 1; }
        if (abs(squirrel.x - targetNut.x) < 5) { nuts.splice(0, 1); squirrelStoleNut = 1; }
    } else {
        if (squirrel.x < holeX - 15) { squirrel.x += 1; }
        else if (squirrel.x > holeX + 15) { squirrel.x -= 1; }
    }
};
var updateFishing = function() {
    if (!fishingLine.active || fishCaught || rawFish.visible) { return; }
    if (fishingLine.hookY < puddle.y + 4) { fishingLine.hookY += 1.5; }
    if (fishingLine.hookY >= puddle.y) {
        fishBobTimer++;
        if (fishBobTimer > 90 && random(1) < 0.02) { fishOnHook = 1; }
    }
    if (fishOnHook && reeling) {
        fishingLine.hookY -= 4;
        if (fishingLine.hookY < 0) {
            fishCaught = 1; fishingLine.active = 0;
            fishOnHook = 0; reeling = 0;
            rawFish.visible = 1;
            rawFish.x = fishingLine.x; rawFish.y = 285;
        }
    }
};
var updateNutGrowth = function() {
    // regrow a nut if the tree runs out while a nut is still needed
    // (stage 4 needs a roasted nut, stage 8 needs nut paste)
    var needNut = (gameStage === 4 && !cookedNut.visible) ||
                  (gameStage === 8 && !nutPaste.visible && !smokedPaste.visible);
    if (needNut && nuts.length === 0 && treeGrown) {
        nuts.push({x:0, y:0, offsetX:0, offsetY:-12, onGround:0, width:12, height:14});
        nutGrowth = 0;
    }
    if (gameStage < 3 || nutGrowth >= 100) { return; }
    nutGrowth += 0.08;
    if (nutGrowth > 100) { nutGrowth = 100; }
};
var updateMushroomGrowth = function() {
    if (gameStage < 5) { return; }
    mushroomSpawnDelay++;
    if (mushroomSpawnDelay === 180) {
        mushrooms.push({x: holeX - 40 + random(-20, 20), y: 289, growth: 0, width:16, height:18});
    }
    if (mushroomSpawnDelay === 360) {
        mushrooms.push({x: holeX + 50 + random(-15, 15), y: 291, growth: 0, width:16, height:18});
    }
    if (mushroomSpawnDelay === 500) {
        mushrooms.push({x: holeX + 10 + random(-10, 10), y: 287, growth: 0, width:16, height:18});
    }
    for (var i = 0; i < mushrooms.length; i++) {
        if (mushrooms[i].growth < 100) {
            mushrooms[i].growth += 0.08 + i * 0.02;
            if (mushrooms[i].growth > 100) { mushrooms[i].growth = 100; }
        }
    }
};
var updateCursedAppleGrowth = function() {
    if (gameStage < 6 || dayTime) { return; }
    cursedAppleDelay++;
    if (cursedAppleDelay < 120) { return; }
    if (cursedAppleGrowth < 100) {
        cursedAppleGrowth += 0.12;
        if (cursedAppleGrowth > 100) { cursedAppleGrowth = 100; }
    }
};
var updateBushGrowth = function() {
    if (gameStage < 7 || dayTime) { return; }
    bushGrowDelay++;
    if (bushGrowDelay < 150) { return; }
    if (bushGrowth < 100) {
        bushGrowth += 0.15;
        if (bushGrowth > 100) { bushGrowth = 100; }
    }
};
var isMouseInside = function(btn) {
    return (mouseX >= btn.x && mouseX <= (btn.x + btn.width) &&
            mouseY >= btn.y && mouseY <= (btn.y + btn.height));
};
var isCloudCoveringMoon = function() {
    var dx = cloud.x - moon.x; var dy = cloud.y - moon.y;
    return (dx * dx + dy * dy) < (60 * 60);
};

// ============ THE SECRET ROUTE (super secret: it starts at the very first puzzle) ============
// how to find it: click the human's shirt pocket 5 times. it pops open and there's a little cup inside.
// fill the cup at the puddle, then boil it on the burning leaves. the steam floats up into a little
// cloud that rains down ONE big drop... and the drop leaves a keyhole in the dirt.
var SECRET_LEVEL = 99;
var srSqueeze = 0;
var srPressX = -99;
var srPressY = -99;
var srDrop = {state: 0, x: 0, y: 0, vy: 0, glow: 0};
var srPocket = {clicks: 0, open: 0};
var srCup = {x: 212, y: 156, on: 0, inPocket: 1, water: 0, boilT: 0};
var srSteam = {on: 0, x: 0, y: 0, t: 0, sx: 0, sy: 0};
var SR_POCKET_X = 206;
var SR_POCKET_Y = 150;
var srZoom = 0;
var srRoom = 0; // 0 mole's scale, 1 glowworms, 2 backwards bat, 3 root pipes, 4 the crossing, 5 lying beetles, 6 mushroom garden,
                // 7 toad's jugs, 8 acorn tower, 9 snail safe, 10 the door, 11 the rain key
var srExit = 0;
var srTitleT = 0;
var srLight = {x: 200, y: 200};
var srMsg = {txt: "", x: 200, y: 60, t: 0};
var srHeld = -1;
var srPebbles = [];
var srReady = 0;   // has the secret route been set up yet?
var srBuilt = -1;
var srTooth = 0;
var srToothW = 11; // 11 = the gold tooth (heavier), 9 = the cork tooth (lighter)
var srW = {uses: 0, active: 0, tilt: 0, target: 0};
var srMole = {talk: 0, happy: 0, t: 0};
var srWorms = [];
var srWormStart = [];
var srWormPoke = [];
var srBat = {seq: [], input: [], play: -1, playT: 0, wrong: 0, done: 0, fly: 0, said: 0};
var srSpikeLit = [0, 0, 0, 0, 0];
var srDrips = [];
var srPipes = [];
var srPipeDone = 0;
var srFlower = {talk: 0, bloom: 0};
var srCross = {side: [0, 0, 0], raft: 0, load: -1, move: 0, done: 0, talk: 0, tries: 0};
var srBeetles = {st: [], safe: 0, walk: -1, t: 0, talk: [0, 0, 0]};
var srSud = {sol: [], given: [], cell: [], done: 0};
var srJug = {a: 0, b: 0, ca: 3, cb: 5, goal: 4, moves: 0, done: 0};
var srHanoi = {peg: [[4, 3, 2, 1, 0], [], []], held: -1, from: 0, moves: 0};
var srMind = {code: [0, 0, 0, 0], cur: [0, 0, 0, 0], guesses: [], fb: [], done: 0};
var srDoor = {code: [0, 0, 0, 0, 0], order: [0, 1, 2, 3, 4], dial: [0, 0, 0, 0, 0], hold: 0, dark: 0, open: 0, seen: 0};
var SR_NAMES = ["THE MOLE'S SCALE", "THE GLOWWORMS", "THE BACKWARDS BAT", "THE ROOT PIPES", "THE CROSSING", "THE LYING BEETLES", "THE MUSHROOM GARDEN", "THE TOAD'S JUGS", "THE ACORN TOWER", "THE SNAIL SAFE", "THE DOOR", "THE RAIN KEY", "THE FROZEN PUDDLE", "THE PITCH-BLACK TUNNELS", "THE ROOT CLOCK"];
var SR_PEB = 9;
var SR_WEIGHS = 3;
var SR_SCALE_X = 172;
var SR_SCALE_Y = 128;
var SR_MOLE_X = 345;
var SR_MOLE_Y = 225;
var SR_WN = 5;
var SR_BAT_LEN = 8;
var SR_BAT_GAP = 22;
var SR_SPIKE_X = [55, 120, 185, 250, 315];
var SR_SPIKE_L = [95, 130, 82, 122, 100];
var SR_SPIKE_C = [[255, 90, 90], [255, 170, 60], [120, 235, 110], [90, 170, 255], [205, 115, 255]];
var SR_PN = 6;
var SR_PX0 = 62;
var SR_PY0 = 70;
var SR_PS = 45;
var SR_DIGITS = ["111101101101111", "010110010010111", "111001111100111", "111001111001111", "101101111001001",
                 "111100111001111", "111100111101111", "111001001001001", "111101111101111", "111101111001111"];
var SR_PIN_X = [112, 148, 184, 220, 256];
var SR_PIN_Y = 124;
var SR_DOOR_X = 200;
var SR_DOOR_Y = 182;

var srSay = function(txt, x, y) { srMsg = {txt: txt, x: x, y: y, t: 230}; };

// ---- shared drawing ----
var srDrawDropAt = function(x, y, s) {
    noStroke();
    fill(120, 200, 255, 35); ellipse(x, y, 40 * s, 40 * s);
    fill(150, 220, 255, 60); ellipse(x, y, 22 * s, 22 * s);
    fill(170, 225, 255);
    ellipse(x, y + 2 * s, 9 * s, 9 * s);
    triangle(x - 4.4 * s, y + 1 * s, x + 4.4 * s, y + 1 * s, x, y - 8 * s);
    fill(255, 255, 255, 210); ellipse(x - 1.6 * s, y + 1 * s, 2.4 * s, 3.2 * s);
};
var srDrawKeyhole = function(x, y, s, glow) {
    noStroke();
    fill(120, 200, 255, glow * 0.3 * (0.7 + 0.3 * sin(frameCount * 3)));
    ellipse(x, y, 26 * s, 26 * s);
    fill(15, 10, 8, glow);
    ellipse(x, y - 3 * s, 7 * s, 7 * s);
    quad(x - 2 * s, y - 2 * s, x + 2 * s, y - 2 * s, x + 3.6 * s, y + 6 * s, x - 3.6 * s, y + 6 * s);
};
var srDrawMsg = function() {
    if (srMsg.t <= 0) { return; }
    srMsg.t--;
    var a = min(255, srMsg.t * 6);
    var lines = srMsg.txt.split("|");
    textSize(12); textAlign(CENTER);
    var w = 0;
    for (var i = 0; i < lines.length; i++) { w = max(w, textWidth(lines[i]) + 20); }
    var mx = constrain(srMsg.x, w / 2 + 4, 396 - w / 2);
    var h = 10 + lines.length * 15;
    noStroke();
    fill(25, 16, 10, a * 0.88); rect(mx - w / 2, srMsg.y - 15, w, h, 6);
    fill(255, 235, 200, a);
    for (var j = 0; j < lines.length; j++) { text(lines[j], mx, srMsg.y + j * 15); }
};
var srDrawExit = function(x, y) {
    noStroke();
    fill(255, 230, 160, 40 + sin(frameCount * 4) * 25); ellipse(x, y, 70, 58);
    fill(40, 26, 16); ellipse(x, y, 52, 42);
    fill(12, 8, 5); ellipse(x, y + 3, 42, 32);
};
var srDirtWall = function(r, g, b) {
    background(r, g, b);
    noStroke();
    for (var i = 0; i < 40; i++) {
        var px = (i * 97) % 400; var py = (i * 61 + 17) % 400;
        fill(r + 14, g + 10, b + 6); ellipse(px, py, 8 + (i % 5) * 3, 5 + (i % 3) * 2);
        fill(r - 12, g - 10, b - 8); ellipse((px + 43) % 400, (py + 29) % 400, 4 + (i % 4), 3 + (i % 2));
    }
    // roots hanging from the ceiling
    stroke(r + 30, g + 18, b + 6); strokeWeight(3);
    for (var k = 0; k < 7; k++) {
        var rx = 25 + k * 58;
        noFill();
        bezier(rx, 0, rx + 10, 20, rx - 12, 30, rx + 4, 44 + (k % 3) * 10);
    }
    noStroke(); strokeWeight(1);
};

// floating dust in the tunnels (makes it feel alive down here)
var srDust = function() {
    noStroke();
    for (var i = 0; i < 22; i++) {
        var dx = (i * 83 + frameCount * (0.2 + (i % 3) * 0.1)) % 420 - 10;
        var dy = (i * 47 + sin(frameCount * 2 + i * 30) * 12) % 400;
        fill(255, 240, 210, 40 + (i % 4) * 15);
        ellipse(dx, dy, 1.5 + (i % 3), 1.5 + (i % 3));
    }
};
var srDrawMushroom = function(x, y, s, r, g, b) {
    noStroke();
    fill(r, g, b, 40); ellipse(x, y - 6 * s, 26 * s, 20 * s);
    fill(225, 215, 190); rect(x - 1.5 * s, y - 7 * s, 3 * s, 7 * s, 1);
    fill(r, g, b); arc(x, y - 7 * s, 12 * s, 10 * s, 180, 360);
    fill(255, 255, 255, 170); ellipse(x - 2 * s, y - 9 * s, 2 * s, 2 * s); ellipse(x + 2.5 * s, y - 10 * s, 1.5 * s, 1.5 * s);
};

// ============ ROOM SETUP ============
var srShufflePebbles = function() {
    srPebbles = [];
    for (var i = 0; i < SR_PEB; i++) {
        srPebbles.push({on: 0, slot: 0, x: 0, y: 0,
            w: 15 + (i * 7) % 5, h: 11 + (i * 5) % 3, c: 92 + (i * 37) % 50, mark: i % 6});
    }
    srTooth = floor(random(0, SR_PEB));
    srToothW = 11;
    srW = {uses: 0, active: 0, tilt: 0, target: 0};
};
var srWormToggle = function(i) {
    var n = SR_WN;
    var r = floor(i / n); var c = i % n;
    srWorms[i] = 1 - srWorms[i];
    if (r > 0) { srWorms[i - n] = 1 - srWorms[i - n]; }
    if (r < n - 1) { srWorms[i + n] = 1 - srWorms[i + n]; }
    if (c > 0) { srWorms[i - 1] = 1 - srWorms[i - 1]; }
    if (c < n - 1) { srWorms[i + 1] = 1 - srWorms[i + 1]; }
};
var srWormsLit = function() {
    var n = 0;
    for (var i = 0; i < srWorms.length; i++) { n += srWorms[i]; }
    return n;
};
// root pipes: openings are N=1 E=2 S=4 W=8, rotating turns them clockwise
var srRot = function(m) { return ((m << 1) | (m >> 3)) & 15; };
var srPipeAt = function(c, r) { return srPipes[r * SR_PN + c]; };
var srMakePipes = function() {
    var N = SR_PN;
    // a wiggly path from the spring (top-left) to the thirsty flower (bottom-right)
    var path = [];
    var tries = 0;
    while (tries < 200) {
        tries++;
        path = [[0, 0]];
        var seen = {};
        seen["0,0"] = 1;
        var ok = false;
        for (var step = 0; step < 80; step++) {
            var cur = path[path.length - 1];
            if (cur[0] === N - 1 && cur[1] === N - 1) { ok = true; break; }
            var opts = [];
            var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
            for (var k = 0; k < 4; k++) {
                var nx = cur[0] + dirs[k][0]; var ny = cur[1] + dirs[k][1];
                if (nx >= 0 && ny >= 0 && nx < N && ny < N && !seen[nx + "," + ny]) { opts.push([nx, ny]); }
            }
            if (opts.length === 0) { break; }
            var nxt = opts[floor(random(0, opts.length))];
            seen[nxt[0] + "," + nxt[1]] = 1;
            path.push(nxt);
        }
        if (ok && path.length >= 14) { break; }
    }
    srPipes = [];
    for (var i = 0; i < N * N; i++) {
        var kinds = [5, 3, 3, 7, 5, 3];
        srPipes.push({m: kinds[floor(random(0, kinds.length))], sol: -1, fixed: 0, wet: 0, spin: 0});
    }
    var dirBit = function(ax, ay, bx, by) {
        if (bx > ax) { return 2; } if (bx < ax) { return 8; } if (by > ay) { return 4; } return 1;
    };
    for (var p = 0; p < path.length; p++) {
        var m = 0;
        var px = path[p][0]; var py = path[p][1];
        if (p === 0) { m |= 8; } else { m |= dirBit(px, py, path[p - 1][0], path[p - 1][1]); }
        if (p === path.length - 1) { m |= 2; } else { m |= dirBit(px, py, path[p + 1][0], path[p + 1][1]); }
        var T = srPipes[py * N + px];
        T.m = m; T.sol = m;
    }
    // a few stuck rocks where the path doesn't go
    var rocks = 0;
    while (rocks < 4) {
        var ri = floor(random(0, N * N));
        if (srPipes[ri].sol < 0 && !srPipes[ri].fixed) { srPipes[ri].fixed = 1; srPipes[ri].m = 0; rocks++; }
    }
    // scramble every root
    for (var q = 0; q < N * N; q++) {
        var spins = floor(random(1, 4));
        for (var sp = 0; sp < spins; sp++) { srPipes[q].m = srRot(srPipes[q].m); }
    }
};
// water flows from the spring through any roots that connect
var srPipeFlow = function() {
    var N = SR_PN;
    for (var i = 0; i < N * N; i++) { srPipes[i].wet = 0; }
    if (!(srPipes[0].m & 8)) { return false; }
    var q = [[0, 0]]; srPipes[0].wet = 1;
    var dirs = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
    while (q.length > 0) {
        var c = q.shift();
        var T = srPipeAt(c[0], c[1]);
        for (var k = 0; k < 4; k++) {
            if (!(T.m & dirs[k][2])) { continue; }
            var nx = c[0] + dirs[k][0]; var ny = c[1] + dirs[k][1];
            if (nx < 0 || ny < 0 || nx >= N || ny >= N) { continue; }
            var U = srPipeAt(nx, ny);
            if (U.wet || !(U.m & dirs[k][3])) { continue; }
            U.wet = 1; q.push([nx, ny]);
        }
    }
    var last = srPipeAt(N - 1, N - 1);
    return last.wet && (last.m & 2);
};
// ============ MORE UNDERGROUND ROOMS: the frozen puddle (12), the pitch-black tunnels (13), the root clock (14) ============
var srIce = {};
var srMaze = {};
var srClock = {};
var SR_IX = 56;
var SR_IY = 84;
var SR_IS = 32;
// ---- the frozen puddle: you SLIDE until you hit a rock ----
var srIceSlide = function(pos, dr, dc) {
    var r = floor(pos / 9); var c = pos % 9;
    while (true) {
        var nr = r + dr; var nc = c + dc;
        if (nr < 0 || nr > 8 || nc < 0 || nc > 8 || srIce.rock[nr * 9 + nc]) { break; }
        r = nr; c = nc;
    }
    return r * 9 + c;
};
var srIceBFS = function(from) {
    var prev = []; for (var i = 0; i < 81; i++) { prev.push(-2); }
    prev[from] = -1; var q = [from];
    var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (q.length > 0) {
        var u = q.shift();
        if (u === srIce.goal) { break; }
        for (var d = 0; d < 4; d++) {
            var v = srIceSlide(u, dirs[d][0], dirs[d][1]);
            if (prev[v] === -2) { prev[v] = u; q.push(v); }
        }
    }
    var path = [];
    if (prev[srIce.goal] === -2) { return null; }
    var c = srIce.goal;
    while (c !== from) { path.unshift(c); c = prev[c]; }
    return path;
};
var srMakeIce = function() {
    for (var tries = 0; tries < 500; tries++) {
        srIce = {rock: [], start: 72, goal: 8, at: 72, moves: 0, anim: 0, from: 72};
        for (var i = 0; i < 81; i++) { srIce.rock.push(random(0, 1) < 0.16 ? 1 : 0); }
        srIce.rock[72] = 0; srIce.rock[8] = 0;
        var p = srIceBFS(72);
        if (p !== null && p.length >= 8) { return; }
    }
};
var drawSrIce = function() {
    srDirtWall(46, 56, 70);
    noStroke();
    var I = srIce; var i;
    fill(160, 200, 230); rect(SR_IX - 6, SR_IY - 6, SR_IS * 9 + 12, SR_IS * 9 + 12, 8);
    for (i = 0; i < 81; i++) {
        var x = SR_IX + (i % 9) * SR_IS; var y = SR_IY + floor(i / 9) * SR_IS;
        fill(190 + (i * 7) % 20, 225, 245); rect(x, y, SR_IS, SR_IS);
        fill(255, 255, 255, 90); rect(x + 4, y + 4, 8, 2);
        if (I.rock[i]) {
            fill(90, 84, 80); ellipse(x + SR_IS / 2, y + SR_IS / 2 + 2, SR_IS - 4, SR_IS - 8);
            fill(120, 114, 108); ellipse(x + SR_IS / 2 - 3, y + SR_IS / 2 - 2, SR_IS - 14, SR_IS - 16);
            fill(240, 250, 255); ellipse(x + SR_IS / 2 + 4, y + 8, 10, 4);
        }
    }
    // the way out (top-right)
    var gx = SR_IX + (I.goal % 9) * SR_IS + SR_IS / 2; var gy = SR_IY + floor(I.goal / 9) * SR_IS + SR_IS / 2;
    fill(40, 26, 16); ellipse(gx, gy, 26, 22); fill(255, 230, 160, 80 + sin(frameCount * 6) * 50); ellipse(gx, gy, 30, 26);
    // you, sliding
    var tx = SR_IX + (I.at % 9) * SR_IS + SR_IS / 2; var ty = SR_IY + floor(I.at / 9) * SR_IS + SR_IS / 2;
    var px = tx; var py = ty;
    if (I.anim > 0) {
        I.anim--;
        var k = 1 - I.anim / 12;
        var fx = SR_IX + (I.from % 9) * SR_IS + SR_IS / 2; var fy = SR_IY + floor(I.from / 9) * SR_IS + SR_IS / 2;
        px = fx + (tx - fx) * k; py = fy + (ty - fy) * k;
        if (I.anim === 0 && I.at === I.goal) { srExit = 1; flash(200, 240, 255, 80); srSay("you slid right into the hole! (click it)", 200, 386); }
    }
    srDrawDropAt(px, py - 4, 0.9);
    fill(20, 30, 50, 200); rect(150, 2, 100, 18, 5);
    fill(220, 235, 255); textSize(9); textAlign(CENTER); text("START OVER", 200, 15);
    fill(220, 235, 255); text("slides: " + I.moves, 340, 15);
    fill(220, 235, 255, 160); textSize(8); text("click on a side of the drop to slide that way. you can't stop until you hit a rock!", 200, 78);
    srDust();
    srDarkness(srLight.x, srLight.y, 190, 70);
};
// ---- the pitch-black tunnels: an invisible maze. bump a wall = back to the start (but now you can SEE that wall) ----
var SR_MX = 60;
var SR_MY = 86;
var SR_MS = 40;
var srMakeMaze = function() {
    // walls: 0 open, 1 wall. right walls rw[i], down walls dw[i]
    var rw = []; var dw = []; var seen = [];
    for (var i = 0; i < 49; i++) { rw.push(1); dw.push(1); seen.push(0); }
    var st = [0]; seen[0] = 1;
    while (st.length > 0) {
        var u = st[st.length - 1]; var r = floor(u / 7); var c = u % 7;
        var opts = [];
        if (r > 0 && !seen[u - 7]) { opts.push(u - 7); }
        if (r < 6 && !seen[u + 7]) { opts.push(u + 7); }
        if (c > 0 && !seen[u - 1]) { opts.push(u - 1); }
        if (c < 6 && !seen[u + 1]) { opts.push(u + 1); }
        if (opts.length === 0) { st.pop(); continue; }
        var v = opts[floor(random(0, opts.length))];
        if (v === u + 1) { rw[u] = 0; } else if (v === u - 1) { rw[v] = 0; } else if (v === u + 7) { dw[u] = 0; } else { dw[v] = 0; }
        seen[v] = 1; st.push(v);
    }
    srMaze = {rw: rw, dw: dw, seenR: [], seenD: [], at: 0, trail: [], bonks: 0};
    for (var k = 0; k < 49; k++) { srMaze.seenR.push(0); srMaze.seenD.push(0); srMaze.trail.push(0); }
    srMaze.trail[0] = 1;
};
var srMazeOpen = function(a, b) {
    var M = srMaze;
    if (b === a + 1) { return !M.rw[a]; } if (b === a - 1) { return !M.rw[b]; }
    if (b === a + 7) { return !M.dw[a]; } return !M.dw[b];
};
var srMazePath = function() {
    var M = srMaze;
    var prev = []; for (var i = 0; i < 49; i++) { prev.push(-2); }
    prev[M.at] = -1; var q = [M.at];
    while (q.length > 0) {
        var u = q.shift();
        var nb = [u - 7, u + 7, u - 1, u + 1];
        for (var k = 0; k < 4; k++) {
            var v = nb[k];
            if (v < 0 || v > 48) { continue; }
            if ((k >= 2) && floor(v / 7) !== floor(u / 7)) { continue; }
            if (prev[v] === -2 && srMazeOpen(u, v)) { prev[v] = u; q.push(v); }
        }
    }
    var path = []; var c = 48;
    while (c !== M.at && c >= 0) { path.unshift(c); c = prev[c]; }
    return path;
};
var drawSrMaze = function() {
    srDirtWall(20, 16, 22);
    noStroke();
    var M = srMaze; var i;
    for (i = 0; i < 49; i++) {
        var x = SR_MX + (i % 7) * SR_MS; var y = SR_MY + floor(i / 7) * SR_MS;
        fill(M.trail[i] ? 46 : 28, M.trail[i] ? 40 : 24, M.trail[i] ? 60 : 32); rect(x + 1, y + 1, SR_MS - 2, SR_MS - 2, 4);
        if (M.trail[i]) { fill(120, 180, 255, 60); ellipse(x + SR_MS / 2, y + SR_MS / 2, 8, 8); }
    }
    // walls you already bumped into (they glow now)
    stroke(255, 140, 80, 220); strokeWeight(4);
    for (i = 0; i < 49; i++) {
        var wx = SR_MX + (i % 7) * SR_MS; var wy = SR_MY + floor(i / 7) * SR_MS;
        if (M.seenR[i]) { line(wx + SR_MS, wy + 2, wx + SR_MS, wy + SR_MS - 2); }
        if (M.seenD[i]) { line(wx + 2, wy + SR_MS, wx + SR_MS - 2, wy + SR_MS); }
    }
    noStroke();
    noFill(); stroke(80, 70, 90); strokeWeight(3); rect(SR_MX, SR_MY, SR_MS * 7, SR_MS * 7, 4); noStroke();
    // the exit glow (bottom-right)
    fill(255, 230, 160, 60 + sin(frameCount * 5) * 40); ellipse(SR_MX + 6.5 * SR_MS, SR_MY + 6.5 * SR_MS, 34, 34);
    srDrawDropAt(SR_MX + (M.at % 7) * SR_MS + SR_MS / 2, SR_MY + floor(M.at / 7) * SR_MS + SR_MS / 2 - 4, 0.9);
    fill(220, 210, 240); textSize(8); textAlign(CENTER);
    text("click a square NEXT to the drop to move. hit a wall = BONK, back to the start (but the wall lights up).", 200, 80);
    text("bonks: " + M.bonks, 340, 396);
    if (srExit) { srDrawExit(SR_MX + 6.5 * SR_MS, SR_MY + 6.5 * SR_MS); }
    srDust();
};
// ---- the root clock: hop around the circle. from a seed you hop its number left OR right. light every seed ----
var SR_CN = 10;
var srClockPos = function(i) { var a = -90 + i * 36; return [200 + cos(a) * 120, 218 + sin(a) * 120]; };
var srClockGo = function(vals, used, path, cur, n) {
    // tries to keep hopping from cur until every seed is used
    if (n === SR_CN) { return true; }
    var opts = [(cur + vals[cur]) % SR_CN, (cur - vals[cur] + SR_CN * 4) % SR_CN];
    for (var o = 0; o < 2; o++) {
        var nx = opts[o];
        if (used[nx]) { continue; }
        used[nx] = 1; path.push(nx);
        if (srClockGo(vals, used, path, nx, n + 1)) { return true; }
        used[nx] = 0; path.pop();
    }
    return false;
};
var srClockSolve = function(vals) {
    // finds one full order (start anywhere). also counts how many starts work
    var res = {first: null, starts: 0};
    for (var s = 0; s < SR_CN; s++) {
        var used = []; for (var k = 0; k < SR_CN; k++) { used.push(0); }
        var path = [s]; used[s] = 1;
        if (srClockGo(vals, used, path, s, 1)) { res.starts++; if (res.first === null) { res.first = path.slice(0); } }
    }
    return res;
};
var srMakeClock = function() {
    for (var tries = 0; tries < 400; tries++) {
        var vals = [];
        for (var i = 0; i < SR_CN; i++) { vals.push(1 + floor(random(0, 4))); }
        var r = srClockSolve(vals);
        if (r.starts >= 1 && r.starts <= 2) { srClock = {vals: vals, used: [], cur: -1, sol: r.first, n: 0}; for (var k = 0; k < SR_CN; k++) { srClock.used.push(0); } return; }
    }
    srClock = {vals: [1, 3, 2, 3, 1, 2, 4, 3, 1, 2], used: [], cur: -1, sol: null, n: 0};
    for (var z = 0; z < SR_CN; z++) { srClock.used.push(0); }
    srClock.sol = srClockSolve(srClock.vals).first;
};
var drawSrClock = function() {
    srDirtWall(50, 40, 30);
    noStroke();
    var K = srClock; var i;
    // the big root ring
    noFill(); stroke(100, 70, 40); strokeWeight(14); ellipse(200, 218, 240, 240);
    stroke(130, 92, 54); strokeWeight(6); ellipse(200, 218, 240, 240); noStroke();
    fill(70, 50, 30); ellipse(200, 218, 60, 60);
    fill(255, 230, 160); textSize(10); textAlign(CENTER); text(K.cur < 0 ? "pick a" : "now at", 200, 214); text(K.cur < 0 ? "start!" : "" + K.vals[K.cur], 200, 228);
    for (i = 0; i < SR_CN; i++) {
        var p = srClockPos(i);
        var can = K.cur >= 0 && !K.used[i] && (i === (K.cur + K.vals[K.cur]) % SR_CN || i === (K.cur - K.vals[K.cur] + SR_CN * 4) % SR_CN);
        if (can) { fill(255, 255, 160, 80 + sin(frameCount * 10) * 60); ellipse(p[0], p[1], 50, 50); }
        if (K.used[i]) { fill(255, 220, 90, 70); ellipse(p[0], p[1], 46, 46); fill(255, 220, 90); }
        else { fill(110, 80, 50); }
        ellipse(p[0], p[1], 36, 30);
        fill(K.used[i] ? 90 : 240, K.used[i] ? 60 : 230, K.used[i] ? 20 : 200); textSize(16); text("" + K.vals[i], p[0], p[1] + 6);
        if (i === K.cur) { noFill(); stroke(120, 220, 255); strokeWeight(3); ellipse(p[0], p[1], 44, 38); noStroke(); }
    }
    fill(230, 210, 180); textSize(8);
    text("from a seed, hop EXACTLY its number of spots, left or right (lit seeds still count as spots).", 200, 70);
    text("light up ALL the seeds. you can't land on a lit one twice!", 200, 82);
    fill(20, 16, 10, 200); rect(150, 372, 100, 18, 5);
    fill(240, 230, 210); textSize(9); text("START OVER", 200, 385);
    if (srExit) { srDrawExit(200, 218); }
    srDust();
    srDarkness(srLight.x, srLight.y, 200, 60);
};
var srSetupMore = function(r) {
    if (r === 12) { srMakeIce(); }
    else if (r === 13) { srMakeMaze(); }
    else if (r === 14) { srMakeClock(); }
};
var srEnterRoom = function(r) {
    srReady = 1; srBuilt = r;
    srRoom = r; srExit = 0; srTitleT = 220; srHeld = -1; srMsg.t = 0;
    fadeAmt = 255;
    srLight = {x: mouseX, y: mouseY};
    if (r === 0) {
        srShufflePebbles();
        srMole = {talk: 0, happy: 0, t: 0};
    } else if (r === 1) {
        srWorms = []; srWormPoke = [];
        for (var i = 0; i < SR_WN * SR_WN; i++) { srWorms.push(1); srWormPoke.push(0); }
        while (srWormsLit() > 17 || srWormsLit() === 25) {
            for (var k = 0; k < 13; k++) { srWormToggle(floor(random(0, SR_WN * SR_WN))); }
        }
        srWormStart = srWorms.slice(0);
    } else if (r === 2) {
        srBat = {seq: [], input: [], play: -1, playT: 0, wrong: 0, done: 0, fly: 0, said: 0};
        var last = -1;
        while (srBat.seq.length < SR_BAT_LEN) {
            var s = floor(random(0, 5));
            if (s !== last) { srBat.seq.push(s); last = s; }
        }
        srDrips = [];
    } else if (r === 3) {
        srMakePipes();
        while (srPipeFlow()) { srMakePipes(); }
        srPipeDone = 0; srFlower = {talk: 0, bloom: 0};
    } else if (r === 4) {
        srCross = {side: [0, 0, 0], raft: 0, load: -1, move: 0, done: 0, talk: 0, tries: 0};
    } else if (r === 5) {
        srBeetles = {st: [], safe: 0, walk: -1, t: 0, talk: [0, 0, 0]};
    } else if (r === 6) {
        srSud = {sol: [], given: [], cell: [], done: 0};
    } else if (r === 7) {
        var sets = [[3, 5, 4], [5, 8, 6], [4, 9, 6], [3, 7, 5]];
        var st = sets[floor(random(0, sets.length))];
        srJug = {a: 0, b: 0, ca: st[0], cb: st[1], goal: st[2], moves: 0, done: 0};
    } else if (r === 8) {
        srHanoi = {peg: [[4, 3, 2, 1, 0], [], []], held: -1, from: 0, moves: 0};
    } else if (r === 9) {
        srMind = {code: [floor(random(0, 6)), floor(random(0, 6)), floor(random(0, 6)), floor(random(0, 6))],
                  cur: [0, 0, 0, 0], guesses: [], fb: [], done: 0};
    } else if (r === 10) {
        var code = []; var order = [0, 1, 2, 3, 4];
        for (var d = 0; d < 5; d++) { code.push(floor(random(0, 10))); }
        srDoor = {code: code, order: order, dial: [0, 0, 0, 0, 0], hold: 0, dark: 0, open: 0, seen: 0};
    } else if (r >= 12) {
        srSetupMore(r);
    }
};
var srInit = function() {
    srEnterRoom(0);
};

// ============ LEVEL 1 part: the squeeze + the drop + the keyhole ============
var srL1Update = function() {
    srSqueeze = 0;
    // the cup of puddle water boiling on the burning leaves
    if (srCup.water === 2) {
        srCup.boilT++;
        if (srCup.boilT % 6 === 0) { burst(srCup.x + random(-4, 4), srCup.y - 10, 200, 230, 255, 1, 0.8, -0.04); }
        if (srCup.boilT === 150) {
            srCup.water = 3;
            srSteam = {on: 1, x: srCup.x, y: srCup.y - 16, t: 0, sx: srCup.x, sy: srCup.y - 16};
            wolfMessage = "the water boils into steam... it's floating UP."; wolfMessageTimer = 180;
        }
    }
    // the steam rises into a little cloud, then rains down ONE big drop
    if (srSteam.on) {
        srSteam.t++;
        var k = min(1, srSteam.t / 110);
        srSteam.x = srSteam.sx + 60 * k;
        srSteam.y = srSteam.sy + (110 - srSteam.sy) * k;
        if (srSteam.t === 180) {
            srDrop = {state: 1, x: srSteam.x, y: srSteam.y + 22, vy: 0, glow: 0};
            wolfMessage = "*plip* ...one BIG raindrop falls out of it!"; wolfMessageTimer = 160;
        }
        if (srSteam.t > 260) { srSteam.on = 0; }
    }
    if (srDrop.state === 1) {
        srDrop.vy += 0.18; srDrop.y += srDrop.vy;
        if (srDrop.y >= 338) {
            srDrop.y = 338; srDrop.state = 2;
            burst(srDrop.x, 338, 140, 210, 255, 14, 2, 0.08);
            shake(1.5);
        }
    }
    if (srDrop.state === 2 && srDrop.glow < 255) { srDrop.glow += 3; }
};
var srDrawCup = function(x, y, water) {
    noStroke();
    fill(0, 0, 0, 50); ellipse(x + 1, y + 8, 18, 4);
    noFill(); stroke(225, 225, 232); strokeWeight(2.5); arc(x + 7, y - 1, 9, 10, -90, 90); noStroke();
    fill(225, 225, 232); rect(x - 7, y - 8, 14, 16, 2);
    fill(200, 200, 210); rect(x - 7, y + 4, 14, 4, 2);
    fill(180, 60, 60); rect(x - 7, y - 3, 14, 3);
    if (water === 1 || water === 2) {
        fill(80, 150, 230); ellipse(x, y - 7, 12, 4);
        if (water === 2) {
            fill(220, 240, 255); ellipse(x - 3 + sin(frameCount * 20) * 2, y - 8, 3, 3); ellipse(x + 3, y - 8 + sin(frameCount * 25), 2, 2);
            stroke(240, 245, 255, 150); strokeWeight(1.5); noFill();
            for (var w = 0; w < 3; w++) {
                var wx = x - 4 + w * 4; var wt = (frameCount * 2 + w * 15) % 30;
                bezier(wx, y - 10 - wt * 0.3, wx - 3, y - 14 - wt * 0.6, wx + 3, y - 18 - wt * 0.8, wx, y - 22 - wt);
            }
            noStroke();
        }
    } else {
        fill(60, 60, 66); ellipse(x, y - 7, 12, 4);
    }
};
var drawSecretL1 = function() {
    srL1Update();
    if (srSqueeze > 0) {
        var q = srSqueeze / 210;
        noStroke();
        fill(30, 30, 50, q * 130);
        ellipse(cloud.x, cloud.y + 4, 112 - q * 16, 58 - q * 12);
        // a drop gathering underneath
        var ds = 2 + q * 7;
        var dy = cloud.y + 32 + q * 5;
        fill(160, 215, 255, 80 + q * 175);
        ellipse(cloud.x, dy, ds, ds);
        triangle(cloud.x - ds * 0.48, dy - 1, cloud.x + ds * 0.48, dy - 1, cloud.x, dy - ds * 1.1);
        // wringing
        stroke(210, 210, 225, q * 170); strokeWeight(1.5);
        var wob = sin(frameCount * 25) * 2;
        line(cloud.x - 56, cloud.y - 8 + wob, cloud.x - 44, cloud.y + 4);
        line(cloud.x + 56, cloud.y - 8 - wob, cloud.x + 44, cloud.y + 4);
        noStroke(); strokeWeight(1);
    }
    // the human's shirt pocket (it only shows once it pops open, and only while he's human)
    if (srPocket.open && !wareWolf) {
        noStroke();
        fill(95, 95, 100); rect(SR_POCKET_X - 1, SR_POCKET_Y, 16, 15, 2);
        fill(25, 25, 30); ellipse(SR_POCKET_X + 7, SR_POCKET_Y + 2, 14, 6);
        fill(120, 120, 125); quad(SR_POCKET_X - 1, SR_POCKET_Y, SR_POCKET_X + 15, SR_POCKET_Y, SR_POCKET_X + 13, SR_POCKET_Y - 6, SR_POCKET_X + 1, SR_POCKET_Y - 6);
        fill(0, 0, 0, Trans); rect(SR_POCKET_X - 2, SR_POCKET_Y - 7, 18, 23);
    }
    // the little cup
    if (srCup.on && !(srCup.inPocket && wareWolf)) { srDrawCup(srCup.x, srCup.y, srCup.water); }
    // the steam cloud
    if (srSteam.on) {
        var sa = srSteam.t < 200 ? min(1, srSteam.t / 40) : max(0, 1 - (srSteam.t - 200) / 60);
        var sz = 0.4 + 0.6 * min(1, srSteam.t / 110);
        var dk = srSteam.t > 130 && srSteam.t < 182 ? (srSteam.t - 130) * 1.6 : 0;
        noStroke();
        fill(235 - dk, 238 - dk, 245 - dk, 220 * sa);
        ellipse(srSteam.x, srSteam.y, 46 * sz, 26 * sz);
        ellipse(srSteam.x - 14 * sz, srSteam.y + 3, 26 * sz, 20 * sz);
        ellipse(srSteam.x + 15 * sz, srSteam.y + 2, 28 * sz, 20 * sz);
        fill(255, 255, 255, 120 * sa); ellipse(srSteam.x - 5 * sz, srSteam.y - 5 * sz, 18 * sz, 10 * sz);
        if (srSteam.t > 150 && srSteam.t < 182) {
            var gs = (srSteam.t - 150) / 32 * 9;
            fill(160, 215, 255); ellipse(srSteam.x, srSteam.y + 14 + gs, gs, gs);
        }
    }
    if (srDrop.state === 1) { srDrawDropAt(srDrop.x, srDrop.y, 1.6); }
    if (srDrop.state === 2) {
        if (srZoom > 0) {
            srZoom++;
            var t = min(1, srZoom / 70);
            var zs = 1 + t * t * t * 120;
            var zx = srDrop.x + (200 - srDrop.x) * t;
            var zy = srDrop.y + (230 - srDrop.y) * t;
            fill(0, 0, 0, t * 255); noStroke();
            srDrawKeyhole(zx, zy, zs, 255);
            if (srZoom > 70) {
                fill(0); rect(0, 0, 400, 400);
                level = SECRET_LEVEL;
                srInit();
            }
        } else {
            srDrawKeyhole(srDrop.x, srDrop.y + 2, 1, srDrop.glow);
        }
    }
};
// returns true if it used the click
var srL1Pressed = function() {
    srPressX = mouseX; srPressY = mouseY;
    if (srZoom > 0) { return true; }
    if (srDrop.state === 2 && dist(mouseX, mouseY, srDrop.x, srDrop.y) < 12) {
        srZoom = 1; draggingBtn = -1;
        return true;
    }
    // pick up the cup (not while it's boiling)
    if (srCup.on && srCup.water !== 2 && !(srCup.inPocket && wareWolf) && dist(mouseX, mouseY, srCup.x, srCup.y) < 13) {
        srCup.inPocket = 0;
        draggingBtn = srCup;
        dragOffsetX = mouseX - srCup.x; dragOffsetY = mouseY - srCup.y;
        return true;
    }
    // the human's shirt pocket: click it 5 times
    if (!srPocket.open && !wareWolf && srDrop.state === 0 && mouseX > SR_POCKET_X - 3 && mouseX < SR_POCKET_X + 17 && mouseY > SR_POCKET_Y - 4 && mouseY < SR_POCKET_Y + 16) {
        srPocket.clicks++;
        burst(SR_POCKET_X + 7, SR_POCKET_Y + 6, 170, 170, 175, 3, 1.2, 0.05);
        if (srPocket.clicks >= 5) {
            srPocket.open = 1; srCup.on = 1; srCup.inPocket = 1;
            srCup.x = SR_POCKET_X + 7; srCup.y = SR_POCKET_Y - 2;
            burst(SR_POCKET_X + 7, SR_POCKET_Y, 230, 230, 240, 10, 2, 0.05);
            wolfMessage = "the pocket pops open! there's a little cup inside."; wolfMessageTimer = 180;
        }
        return true;
    }
    return false;
};
// letting go of the cup: fill it at the puddle, boil it on the fire
var srL1Released = function() {
    if (draggingBtn !== srCup) { return false; }
    draggingBtn = -1;
    var px = puddle.x + puddle.width * 0.5; var py = puddle.y;
    var fx = leaves.x + 20; var fy = leaves.y + 10;
    if (dist(srCup.x, srCup.y, px, py) < 34) {
        if (!puddle.visible) { wolfMessage = "the ground is dry here. (no puddle... yet)"; wolfMessageTimer = 150; }
        else if (srCup.water === 1) { wolfMessage = "the cup is already full of puddle water."; wolfMessageTimer = 150; }
        else {
            srCup.water = 1;
            burst(px, py, 120, 180, 255, 10, 2, 0.1);
            wolfMessage = "you scoop up some puddle water."; wolfMessageTimer = 150;
        }
    } else if (leavesOnFire && dist(srCup.x, srCup.y, fx, fy) < 40) {
        if (srCup.water === 1) {
            srCup.water = 2; srCup.boilT = 0;
            srCup.x = fx; srCup.y = fy - 12;
            wolfMessage = "you set the cup on the fire. the water starts to boil..."; wolfMessageTimer = 180;
        } else {
            wolfMessage = "an empty cup on a fire. it just gets warm."; wolfMessageTimer = 150;
        }
    }
    if (srCup.water !== 2) { srCup.y = constrain(srCup.y, 300, 385); }
    return true;
};

// ============ ROOM 0: THE MOLE'S SCALE (12 pebbles, 3 weighs, heavier OR lighter) ============
var srPanPos = function(side) {
    var a = srW.tilt;
    var ex = SR_SCALE_X + (side === 1 ? -1 : 1) * 85 * cos(a);
    var ey = SR_SCALE_Y + (side === 1 ? 1 : -1) * 85 * sin(a);
    return [ex, ey + 72, ex, ey];
};
var srPanCount = function(side) {
    var n = 0;
    for (var i = 0; i < SR_PEB; i++) { if (srPebbles[i].on === side) { n++; } }
    return n;
};
var srFreeSlot = function(side) {
    for (var s = 0; s < 4; s++) {
        var used = false;
        for (var i = 0; i < SR_PEB; i++) { if (srPebbles[i].on === side && srPebbles[i].slot === s) { used = true; } }
        if (!used) { return s; }
    }
    return -1;
};
var srPlacePebbles = function() {
    var offs = [[-17, 0], [0, 0], [17, 0], [-8, -10]];
    for (var i = 0; i < SR_PEB; i++) {
        var p = srPebbles[i];
        if (i === srHeld) { p.x = mouseX; p.y = mouseY; }
        else if (p.on === 0) { p.x = 34 + i * 33; p.y = 354; }
        else if (p.on === 1 || p.on === 2) {
            var pp = srPanPos(p.on);
            p.x = pp[0] + offs[p.slot][0]; p.y = pp[1] - 7 + offs[p.slot][1];
        }
    }
};
var srDrawPebble = function(p) {
    noStroke();
    fill(0, 0, 0, 60); ellipse(p.x + 1, p.y + p.h / 2, p.w, 4);
    fill(p.c, p.c - 6, p.c - 14); ellipse(p.x, p.y, p.w, p.h);
    fill(p.c + 22, p.c + 16, p.c + 8); ellipse(p.x - 3, p.y - 2, p.w * 0.45, p.h * 0.4);
    fill(p.c - 30, p.c - 34, p.c - 40);
    if (p.mark === 0) { ellipse(p.x + 4, p.y + 2, 3, 3); }
    else if (p.mark === 1) { rect(p.x - 4, p.y + 1, 8, 1.5); }
    else if (p.mark === 2) { ellipse(p.x - 4, p.y + 2, 2, 2); ellipse(p.x + 3, p.y - 1, 2, 2); }
    else if (p.mark === 3) { triangle(p.x + 2, p.y - 3, p.x + 6, p.y + 2, p.x + 1, p.y + 3); }
    else if (p.mark === 4) { rect(p.x - 1, p.y - 4, 1.5, 7); }
    else { ellipse(p.x, p.y + 1, 5, 2); }
};
var srDrawMole = function(x, y, happy) {
    noStroke();
    fill(70, 45, 28); ellipse(x, y + 36, 112, 40);
    fill(88, 58, 35); ellipse(x - 12, y + 31, 70, 20);
    fill(60, 52, 58); ellipse(x, y + 8, 64, 66);
    fill(76, 67, 73); ellipse(x - 6, y, 40, 40);
    stroke(45, 38, 44); strokeWeight(1);
    for (var f = 0; f < 5; f++) { line(x - 14 + f * 7, y + 20, x - 12 + f * 7, y + 28); }
    noStroke();
    fill(70, 62, 68); ellipse(x, y - 22, 50, 40);
    fill(96, 82, 88); ellipse(x, y - 13, 26, 18);
    fill(238, 135, 158);
    for (var s = 0; s < 10; s++) { ellipse(x + cos(s * 36) * 6, y - 18 + sin(s * 36) * 5, 5, 5); }
    fill(255, 172, 188); ellipse(x, y - 18, 7, 6);
    fill(20); ellipse(x - 11, y - 30, 3, 3); ellipse(x + 11, y - 30, 3, 3);
    noFill(); stroke(205, 182, 120); strokeWeight(1.5);
    ellipse(x - 11, y - 30, 11, 11); ellipse(x + 11, y - 30, 11, 11); line(x - 5.5, y - 30, x + 5.5, y - 30);
    noStroke();
    // a tiny nightcap
    fill(90, 120, 200); triangle(x - 16, y - 38, x + 12, y - 40, x + 22, y - 58);
    fill(240); ellipse(x + 22, y - 58, 7, 7); rect(x - 17, y - 41, 30, 5, 2);
    fill(40, 20, 25); arc(x, y - 6, 16, 11, 0, 180);
    fill(250); rect(x - 6, y - 6, 3, 3); rect(x + 3, y - 6, 3, 3);
    if (happy) {
        if (srToothW === 11) { fill(255, 210, 60); } else { fill(200, 160, 110); }
        rect(x - 1.5, y - 6, 3, 3.5);
        fill(255, 255, 210, 150 + sin(frameCount * 10) * 100); ellipse(x + 1, y - 5, 2, 2);
    }
    for (var h = -1; h <= 1; h += 2) {
        var hx = x + h * 31;
        fill(240, 175, 185); ellipse(hx, y + 6, 20, 16);
        fill(232, 226, 215);
        for (var c = 0; c < 4; c++) { triangle(hx - 7 + c * 4.5, y + 12, hx - 4 + c * 4.5, y + 12, hx - 5.5 + c * 4.5, y + 19); }
    }
};
// ---------- extra detail for the first underground rooms (S-1 to S-5) + the rain key room ----------
var srRoots = function(xs, len) {
    stroke(70, 48, 28); strokeWeight(3); noFill();
    for (var i = 0; i < xs.length; i++) {
        var x = xs[i]; var l = len + (i * 13) % 20;
        var sw = sin(frameCount * 2 + i * 50) * 3;
        bezier(x, 0, x + 6, l * 0.3, x - 6 + sw, l * 0.6, x + sw, l);
        strokeWeight(1.5); line(x + 2, l * 0.4, x + 10, l * 0.55); strokeWeight(3);
    }
    noStroke();
};
var srStalactites = function(xs, c) {
    noStroke();
    for (var i = 0; i < xs.length; i++) {
        var h = 18 + (i * 17) % 22;
        fill(c, c * 0.88, c * 0.8); triangle(xs[i] - 9, 0, xs[i] + 9, 0, xs[i], h);
        fill(c + 20, (c + 20) * 0.88, (c + 20) * 0.8); triangle(xs[i] - 3, 0, xs[i] + 2, 0, xs[i] - 1, h - 6);
        fill(150, 200, 255, 140); ellipse(xs[i], h + ((frameCount * 2 + i * 40) % 60), 2, 4);
    }
};
var srGlowCrystal = function(x, y, s, r, g, b) {
    noStroke();
    var p = 60 + sin(frameCount * 4 + x) * 30;
    fill(r, g, b, p * 0.5); ellipse(x, y, 40 * s, 40 * s);
    fill(r, g, b, 220);
    quad(x - 4 * s, y + 6 * s, x - 7 * s, y - 6 * s, x - 2 * s, y - 14 * s, x + 1 * s, y + 6 * s);
    quad(x, y + 6 * s, x + 2 * s, y - 18 * s, x + 6 * s, y - 8 * s, x + 6 * s, y + 6 * s);
    quad(x + 5 * s, y + 6 * s, x + 9 * s, y - 4 * s, x + 12 * s, y + 2 * s, x + 10 * s, y + 6 * s);
    fill(255, 255, 255, 170); triangle(x + 1 * s, y - 12 * s, x + 3 * s, y - 15 * s, x + 2.5 * s, y - 6 * s);
};
var srGlowSpores = function(n, r, g, b, y0, y1) {
    noStroke();
    for (var i = 0; i < n; i++) {
        var x = (i * 83 + sin(frameCount * 1.2 + i * 37) * 25 + 400) % 400;
        var y = y1 - ((frameCount * 0.35 + i * 53) % (y1 - y0));
        var a = 110 + sin(frameCount * 6 + i * 45) * 90;
        fill(r, g, b, a * 0.25); ellipse(x, y, 9, 9);
        fill(r, g, b, a); ellipse(x, y, 2.5, 2.5);
    }
};
// S-1 the mole's scale
var srDecorRoom0 = function() {
    noStroke();
    // wooden support beams
    fill(90, 62, 34); rect(0, 0, 9, 400); rect(391, 0, 9, 400); rect(0, 0, 400, 8);
    fill(110, 78, 44); rect(2, 0, 3, 400); rect(393, 0, 3, 400);
    fill(160, 160, 170); ellipse(5, 12, 4, 4); ellipse(395, 12, 4, 4);
    srRoots([96, 150, 214, 372], 34);
    // a little shelf with the mole's pebble jars
    fill(110, 78, 44); rect(344, 66, 52, 5, 1);
    fill(180, 220, 230, 120); rect(350, 46, 14, 20, 3); rect(370, 50, 12, 16, 3);
    fill(140, 130, 120); ellipse(357, 61, 8, 6); ellipse(376, 62, 6, 5);
    fill(240, 200, 60); ellipse(357, 55, 5, 4);
    fill(200, 180, 140); rect(386, 52, 8, 14, 2);
    // a worm poking out of the wall saying hi
    fill(230, 140, 150); ellipse(120, 304, 8, 14); ellipse(120, 296, 8, 8);
    fill(40); ellipse(118, 295, 1.5, 1.5); ellipse(122, 295, 1.5, 1.5);
    fill(50, 34, 22); ellipse(120, 311, 14, 6);
    // a rug under the scale
    fill(150, 60, 50); ellipse(172, 342, 120, 14);
    fill(200, 150, 70); ellipse(172, 342, 100, 8);
    fill(150, 60, 50); ellipse(172, 342, 70, 5);
};
var srGlowRoom0 = function() {
    srGlowCrystal(22, 230, 0.8, 120, 200, 255);
    srGlowCrystal(380, 336, 0.7, 255, 210, 90);
    srGlowSpores(5, 255, 230, 140, 40, 200);
};
// S-2 the glowworms
var srDecorRoom1 = function() {
    noStroke();
    srStalactites([18, 46, 362, 388], 70);
    // moss on the walls + roots on the sides
    fill(70, 110, 55, 170);
    for (var m = 0; m < 7; m++) { ellipse(14 + (m % 2) * 10, 70 + m * 34, 22, 14); ellipse(378 + (m % 2) * 10, 60 + m * 32, 22, 14); }
    stroke(70, 48, 28); strokeWeight(2.5); noFill();
    bezier(0, 150, 20, 170, 10, 210, 30, 240); bezier(400, 200, 380, 220, 392, 260, 372, 290);
    noStroke();
    // a little puddle
    fill(30, 40, 60); ellipse(220, 372, 110, 16);
    fill(80, 120, 170, 120); ellipse(220, 371, 96, 11);
    fill(160, 200, 240, 140); ellipse(200 + (frameCount % 40), 372, 10, 2);
};
var srGlowRoom1 = function() {
    srGlowSpores(9, 190, 255, 140, 20, 330);
    srGlowCrystal(380, 300, 0.7, 150, 255, 160);
    srGlowCrystal(22, 300, 0.7, 150, 255, 160);
};
// S-3 the backwards bat
var srDecorRoom2 = function() {
    noStroke();
    // cobwebs in the corners
    stroke(140, 140, 150, 110); strokeWeight(0.7); noFill();
    line(0, 14, 40, 50); line(0, 14, 20, 70); line(0, 14, 50, 26);
    arc(0, 14, 30, 30, 0, 90); arc(0, 14, 56, 56, 0, 90);
    noStroke();
    // two tiny sleeping bats
    var sb = [[24, 16], [284, 14]];
    for (var i = 0; i < 2; i++) {
        var bx = sb[i][0]; var by = sb[i][1];
        stroke(30, 22, 30); strokeWeight(1); line(bx, by - 4, bx, by); noStroke();
        fill(40, 30, 46); ellipse(bx, by + 8, 12, 16);
        fill(56, 44, 62); triangle(bx - 6, by + 4, bx - 9, by + 16, bx - 2, by + 12); triangle(bx + 6, by + 4, bx + 9, by + 16, bx + 2, by + 12);
        fill(200, 200, 220, 120); textSize(7); textAlign(CENTER); text("z", bx + 9, by + 2 - (frameCount % 40) / 8);
    }
    // old rocks + a little pile of pebbles
    fill(60, 52, 54); ellipse(250, 372, 46, 18); ellipse(110, 378, 34, 14);
    fill(76, 68, 70); ellipse(244, 368, 30, 10);
};
var srGlowRoom2 = function() {
    srGlowCrystal(14, 180, 0.9, 190, 120, 255);
    srGlowCrystal(392, 150, 0.8, 120, 190, 255);
    srGlowCrystal(330, 380, 0.7, 255, 130, 200);
    srGlowCrystal(70, 380, 0.6, 120, 255, 200);
};
// S-4 the root pipes
var srDecorRoom3 = function() {
    noStroke();
    srRoots([120, 210, 300], 30);
    // a wooden frame around the grid
    var N = SR_PN; var S = SR_PS;
    fill(80, 54, 30); rect(SR_PX0 - 9, SR_PY0 - 9, N * S + 18, N * S + 18, 5);
    fill(105, 72, 40); rect(SR_PX0 - 9, SR_PY0 - 9, N * S + 18, 4, 5);
    fill(170, 170, 180);
    ellipse(SR_PX0 - 4, SR_PY0 - 4, 4, 4); ellipse(SR_PX0 + N * S + 4, SR_PY0 - 4, 4, 4);
    ellipse(SR_PX0 - 4, SR_PY0 + N * S + 4, 4, 4); ellipse(SR_PX0 + N * S + 4, SR_PY0 + N * S + 4, 4, 4);
    // little stones + a worm in the corner
    fill(90, 80, 72); ellipse(370, 120, 18, 12); ellipse(382, 140, 12, 8); ellipse(360, 200, 14, 9);
    fill(230, 140, 150); ellipse(376, 240, 7, 12); ellipse(376, 233, 7, 7);
    fill(40); ellipse(374, 232, 1.5, 1.5); ellipse(378, 232, 1.5, 1.5);
};
var srGlowRoom3 = function() {
    srGlowSpores(6, 160, 220, 255, 20, 360);
    srGlowCrystal(384, 60, 0.7, 120, 200, 255);
};
// S-5 the crossing
var srDecorRoom4 = function() {
    noStroke();
    srStalactites([40, 110, 190, 270, 330], 66);
    // rocks on the banks
    fill(70, 62, 56); ellipse(40, 360, 40, 20); ellipse(120, 384, 30, 14); ellipse(290, 370, 36, 18); ellipse(372, 386, 40, 16);
    fill(90, 82, 74); ellipse(36, 355, 24, 10); ellipse(286, 365, 20, 8);
    // reeds by the stream
    stroke(80, 120, 60); strokeWeight(2);
    line(164, 300, 160, 262); line(168, 300, 170, 256); line(236, 300, 238, 260); line(232, 300, 228, 264);
    noStroke();
    fill(120, 80, 50); ellipse(160, 262, 4, 10); ellipse(170, 256, 4, 10); ellipse(238, 260, 4, 10);
    // ripples in the water
    noFill(); stroke(160, 210, 255, 90); strokeWeight(1);
    for (var r = 0; r < 3; r++) {
        var rr = (frameCount * 0.5 + r * 14) % 40;
        ellipse(200, 330 + r * 22, rr, rr * 0.3);
    }
    noStroke();
};
var srGlowRoom4 = function() {
    srGlowSpores(7, 200, 240, 255, 150, 300);
    srGlowCrystal(380, 230, 0.7, 120, 220, 255);
    srGlowCrystal(130, 40, 0.6, 200, 140, 255);
};
// the rain key room
var srDecorKeyRoom = function() {
    noStroke();
    // soft clouds
    fill(255, 255, 255, 200);
    for (var c = 0; c < 3; c++) {
        var cx = (c * 150 + frameCount * 0.3) % 520 - 60; var cy = 50 + c * 18;
        ellipse(cx, cy, 70, 30); ellipse(cx + 26, cy - 8, 50, 30); ellipse(cx - 24, cy + 2, 44, 22);
    }
    // a rainbow behind the key
    var rc = [[255, 120, 120], [255, 190, 110], [255, 235, 120], [140, 220, 140], [130, 180, 255], [190, 150, 240]];
    noFill(); strokeWeight(6);
    for (var i = 0; i < 6; i++) { stroke(rc[i][0], rc[i][1], rc[i][2], 90); arc(200, 210, 300 - i * 12, 260 - i * 12, 180, 360); }
    noStroke();
    // puddles with ripples
    for (var p = 0; p < 3; p++) {
        var px = 80 + p * 120; var py = 350 + (p % 2) * 14;
        fill(170, 210, 245, 140); ellipse(px, py, 80, 16);
        noFill(); stroke(255, 255, 255, 160); strokeWeight(1);
        var rr = (frameCount * 0.7 + p * 20) % 50;
        ellipse(px, py, rr, rr * 0.25);
        noStroke();
    }
    // sparkles
    for (var s = 0; s < 6; s++) {
        var a = 160 + sin(frameCount * 8 + s * 50) * 90;
        var sx = 200 + cos(frameCount * 1.5 + s * 60) * 90; var sy = 170 + sin(frameCount * 1.5 + s * 60) * 70;
        fill(255, 255, 255, a); rect(sx - 4, sy - 0.5, 8, 1); rect(sx - 0.5, sy - 4, 1, 8);
    }
};

var drawSrRoom0 = function() {
    srDirtWall(82, 58, 40);
    noStroke();
    srDecorRoom0();
    // the mole's little home: a framed picture, a matchbox bed, a candle stub
    fill(120, 85, 50); rect(26, 70, 46, 38, 2);
    fill(200, 190, 160); rect(30, 74, 38, 30);
    fill(70, 62, 68); ellipse(49, 92, 18, 16); fill(238, 135, 158); ellipse(49, 94, 5, 4);
    fill(60, 40, 25); textSize(6); textAlign(CENTER); text("MOM", 49, 115);
    fill(190, 60, 40); rect(22, 280, 54, 18, 2);
    fill(240, 210, 120); rect(24, 283, 50, 3);
    fill(230, 220, 240); ellipse(34, 278, 16, 8);
    fill(120, 150, 210); rect(40, 274, 34, 8, 3);
    fill(60, 40, 25); textSize(5); text("MATCHES", 49, 295);
    fill(235, 225, 200); rect(270, 284, 7, 14, 1);
    fill(255, 200, 80, 150 + sin(frameCount * 15) * 60); ellipse(273.5, 280, 5, 8);
    fill(255, 200, 80, 30); ellipse(273.5, 282, 40, 40);
    // the mole's sign
    fill(110, 80, 50); rect(232, 58, 104, 50, 3);
    fill(90, 62, 36); rect(236, 104, 4, 10); rect(328, 104, 4, 10);
    fill(240, 230, 200); textSize(8); textAlign(CENTER);
    text("MY GOLD TOOTH IS", 284, 70); text("HEAVIER THAN A PEBBLE.", 284, 80);
    fill(255, 220, 120); text("TIP: weigh 3 vs 3.", 284, 92);
    fill(200, 190, 160); textSize(7); text("- the mole", 284, 102);
    // the shelf
    fill(95, 68, 42); rect(10, 364, 320, 8, 2);
    fill(70, 48, 30); rect(18, 372, 6, 22); rect(316, 372, 6, 22);
    // the scale
    srW.tilt += ((srW.active ? srW.target : 0) - srW.tilt) * 0.08;
    fill(90, 80, 70); rect(SR_SCALE_X - 40, 296, 80, 12, 3);
    fill(120, 105, 85); rect(SR_SCALE_X - 5, SR_SCALE_Y, 10, 170);
    fill(140, 125, 100); rect(SR_SCALE_X - 3, SR_SCALE_Y, 2, 170);
    fill(60, 50, 40); rect(SR_SCALE_X - 34, 299, 68, 7, 2);
    textSize(7); textAlign(CENTER);
    fill(230, 210, 150);
    var left = SR_WEIGHS - srW.uses;
    if (left <= 0) { text("z z z", SR_SCALE_X, 305); }
    else { text(left + (left === 1 ? " WEIGH LEFT" : " WEIGHS LEFT"), SR_SCALE_X, 305); }
    var pl = srPanPos(1); var pr = srPanPos(2);
    stroke(150, 130, 95); strokeWeight(5);
    line(pl[2], pl[3], pr[2], pr[3]);
    strokeWeight(1.2); stroke(170, 160, 140);
    for (var sd = 0; sd < 2; sd++) {
        var pp = sd === 0 ? pl : pr;
        line(pp[2], pp[3], pp[0] - 31, pp[1] - 4);
        line(pp[2], pp[3], pp[0] + 31, pp[1] - 4);
        line(pp[2], pp[3], pp[0], pp[1] - 4);
    }
    noStroke();
    for (var sd2 = 0; sd2 < 2; sd2++) {
        var p2 = sd2 === 0 ? pl : pr;
        fill(150, 128, 80); arc(p2[0], p2[1] - 4, 70, 22, 0, 180);
        fill(185, 160, 100); ellipse(p2[0], p2[1] - 4, 70, 7);
    }
    // the needle
    fill(200, 60, 50); triangle(SR_SCALE_X - 2, SR_SCALE_Y - 2, SR_SCALE_X + 2, SR_SCALE_Y - 2, SR_SCALE_X + sin(srW.tilt) * 30, SR_SCALE_Y - 30);
    fill(srW.active ? 120 : 210, srW.active ? 100 : 170, 60);
    ellipse(SR_SCALE_X, SR_SCALE_Y, 18, 18);
    fill(255, 230, 140, 160); ellipse(SR_SCALE_X - 3, SR_SCALE_Y - 3, 6, 6);
    // the mole (or his tunnel)
    if (srExit) { srDrawExit(SR_MOLE_X, SR_MOLE_Y + 10); }
    else {
        if (srMole.happy) {
            srMole.t++;
            if (srMole.t > 150) {
                srExit = 1;
                burst(SR_MOLE_X, SR_MOLE_Y + 20, 110, 75, 45, 30, 3, 0.12);
                shake(4);
                srSay("*dig dig dig* ...he dug you a tunnel!", 200, 60);
            }
        }
        srDrawMole(SR_MOLE_X, SR_MOLE_Y + (srMole.t > 110 ? (srMole.t - 110) * 1.4 : 0), srMole.happy);
    }
    srPlacePebbles();
    for (var i = 0; i < SR_PEB; i++) {
        if (srPebbles[i].on !== 3 && i !== srHeld) { srDrawPebble(srPebbles[i]); }
    }
    if (srHeld >= 0) { srDrawPebble(srPebbles[srHeld]); }
    srDust();
    srDarkness(srLight.x, srLight.y, 74, 242);
    srGlowRoom0();
    fill(255, 200, 80, 40); ellipse(273.5, 282, 30, 30);
};
var srRoom0Pressed = function() {
    if (srExit && dist(mouseX, mouseY, SR_MOLE_X, SR_MOLE_Y + 10) < 30) { srEnterRoom(1); return; }
    if (dist(mouseX, mouseY, SR_SCALE_X, SR_SCALE_Y) < 12) {
        if (srW.active) { srW.active = 0; return; }
        if (srW.uses >= SR_WEIGHS) {
            // out of weighs: the mole mixes everything up and wakes the scale back up
            srShufflePebbles();
            shake(4);
            burst(SR_MOLE_X, SR_MOLE_Y, 120, 110, 100, 16, 3, 0.15);
            burst(170, 354, 140, 130, 120, 20, 2.5, 0.1);
            srSay("out of weighs? FINE. *shuffle shuffle*|(he mixes up the pebbles and wakes the scale. try again!)", 200, 60);
            return;
        }
        var lw = 0; var rw = 0;
        for (var i = 0; i < SR_PEB; i++) {
            var wt = (i === srTooth) ? srToothW : 10;
            if (srPebbles[i].on === 1) { lw += wt; }
            if (srPebbles[i].on === 2) { rw += wt; }
        }
        if (lw === 0 && rw === 0) { srSay("...you have to put something ON it first.", 200, 60); return; }
        srW.uses++;
        srW.active = 1;
        srW.target = lw > rw ? 14 : (lw < rw ? -14 : 0);
        if (lw === rw) { srSay("...perfectly balanced.", SR_SCALE_X, 60); }
        return;
    }
    if (srMole.happy) { return; }
    for (var j = SR_PEB - 1; j >= 0; j--) {
        var p = srPebbles[j];
        if (p.on !== 3 && dist(mouseX, mouseY, p.x, p.y) < 11) { srHeld = j; return; }
    }
    if (mouseX > 232 && mouseX < 336 && mouseY > 58 && mouseY < 108) { srSay("if one side goes DOWN, the tooth is on that side.|if it stays level, it's in the 3 you didn't weigh!", 200, 140); return; }
    if (mouseX > 26 && mouseX < 72 && mouseY > 70 && mouseY < 118) { srSay("that's my mom. she's also a mole.|she's very proud of me.", 200, 60); return; }
    if (mouseX > 20 && mouseX < 78 && mouseY > 270 && mouseY < 300) { srSay("my bed. it's a matchbox.|very cozy. slightly flammable.", 200, 60); return; }
    if (dist(mouseX, mouseY, 273, 286) < 10) { srSay("*flicker*", 273, 250); return; }
    if (dist(mouseX, mouseY, SR_MOLE_X, SR_MOLE_Y) < 40) {
        var lines = ["i lost my GOLD TOOTH in the mud.|now it looks just like the pebbles.",
                     "gold is HEAVY. my tooth is a tiny bit|HEAVIER than the other pebbles.",
                     "the scale is old. it only weighs THREE times.|then it takes a nap. (read my sign!)",
                     "give me my tooth. NOT a rock.|i HATE rocks."];
        srSay(lines[srMole.talk % lines.length], 200, 60);
        srMole.talk++;
    }
};
var srRoom0Released = function() {
    if (srHeld < 0) { return; }
    var p = srPebbles[srHeld];
    var idx = srHeld;
    srHeld = -1;
    srW.active = 0;
    var pl = srPanPos(1); var pr = srPanPos(2);
    if (dist(mouseX, mouseY, pl[0], pl[1]) < 42 && (p.on === 1 || srFreeSlot(1) >= 0)) {
        if (p.on !== 1) { var fs1 = srFreeSlot(1); p.on = 1; p.slot = fs1; }
    } else if (dist(mouseX, mouseY, pr[0], pr[1]) < 42 && (p.on === 2 || srFreeSlot(2) >= 0)) {
        if (p.on !== 2) { var fs2 = srFreeSlot(2); p.on = 2; p.slot = fs2; }
    } else if (dist(mouseX, mouseY, SR_MOLE_X, SR_MOLE_Y) < 48) {
        if (srW.uses === 0) {
            p.on = 0;
            srSay("you didn't even WEIGH it.|i don't trust you.", 200, 60);
        } else if (idx === srTooth) {
            p.on = 3;
            srMole.happy = 1; srMole.t = 0;
            burst(SR_MOLE_X, SR_MOLE_Y - 6, 255, 210, 60, 26, 3, 0.02);
            flash(255, 220, 120, 60);
            if (srToothW === 11) { srSay("MY GOLD TOOTH!!! *chomp*|thank you. i will dig you a tunnel.", 200, 60); }
            else { srSay("MY CORK TOOTH! it's... fine. *squish*|thank you. i will dig you a tunnel.", 200, 60); }
        } else {
            srSay("that's a ROCK. i HATE rocks.|(he angrily mixes ALL the pebbles up)", 200, 60);
            shake(6);
            burst(SR_MOLE_X, SR_MOLE_Y, 120, 110, 100, 16, 3, 0.15);
            srShufflePebbles();
        }
    } else {
        p.on = 0;
    }
};

// ============ ROOM 1: THE GLOWWORMS (5 x 5) ============
var srWormX = function(i) { return 88 + (i % SR_WN) * 56; };
var srWormY = function(i) { return 78 + floor(i / SR_WN) * 52; };
var srDrawWorm = function(x, y, on, poke) {
    noStroke();
    if (on) {
        var wig = sin(frameCount * 6 + x * 3) * 3;
        var up = poke > 0 ? poke * 0.6 : 0;
        fill(200, 255, 120, 40); ellipse(x, y - 12, 50, 50);
        fill(200, 255, 120, 25); ellipse(x, y - 12, 74, 74);
        for (var s = 0; s < 5; s++) {
            fill(185 + s * 12, 240, 105 + s * 6);
            ellipse(x + wig * (s / 4), y + 4 - s * 5 - up * (s / 4), 12 - s * 0.6, 9);
            fill(150, 210, 80); ellipse(x + wig * (s / 4), y + 6 - s * 5 - up * (s / 4), 8 - s * 0.5, 1.5);
        }
        var hx = x + wig; var hy = y - 22 - up;
        fill(225, 255, 145); ellipse(hx, hy, 14, 13);
        fill(30); ellipse(hx - 3, hy - 1, 2.5, 3.2); ellipse(hx + 3, hy - 1, 2.5, 3.2);
        fill(255); ellipse(hx - 2.5, hy - 2, 1, 1); ellipse(hx + 3.5, hy - 2, 1, 1);
        noFill(); stroke(30); strokeWeight(1); arc(hx, hy + 2, 6, 4, 0, 180); noStroke();
        fill(255, 150, 150, 120); ellipse(hx - 5, hy + 2, 3, 2); ellipse(hx + 5, hy + 2, 3, 2);
    } else {
        fill(105, 115, 70); ellipse(x, y - 2, 13, 9);
        stroke(35); strokeWeight(1);
        line(x - 4, y - 3, x - 1.5, y - 3); line(x + 1.5, y - 3, x + 4, y - 3);
        noStroke();
        fill(200, 200, 220, 120); textSize(8); textAlign(LEFT);
        text("z", x + 7, y - 8 - (frameCount % 60) / 10);
    }
};
var drawSrRoom1 = function() {
    srDirtWall(64, 48, 40);
    noStroke();
    srDecorRoom1();
    // a sign some worm made
    fill(110, 80, 50); rect(300, 330, 82, 26, 2);
    fill(230, 220, 190); textSize(7); textAlign(CENTER);
    text("QUIET HOURS:", 341, 341); text("ALWAYS", 341, 351);
    // dripping water
    for (var dd = 0; dd < 3; dd++) {
        var dx = 70 + dd * 130; var dy = (frameCount * 3 + dd * 90) % 330;
        fill(140, 190, 240, 140); ellipse(dx, dy, 3, 5);
    }
    srDrawMushroom(20, 360, 1.4, 120, 220, 255);
    srDrawMushroom(268, 362, 1.1, 220, 120, 255);
    srDrawMushroom(384, 300, 1.2, 120, 255, 170);
    for (var i = 0; i < SR_WN * SR_WN; i++) {
        fill(40, 28, 20); ellipse(srWormX(i), srWormY(i) + 2, 36, 28);
        fill(14, 9, 6); ellipse(srWormX(i), srWormY(i) + 4, 28, 20);
        if (!srWorms[i]) { srDrawWorm(srWormX(i), srWormY(i), 0, 0); }
    }
    // the wake-up bell
    stroke(110, 80, 50); strokeWeight(2); line(40, 300, 40, 318); noStroke();
    fill(205, 165, 60); arc(40, 332, 26, 30, 180, 360); rect(27, 331, 26, 4, 1);
    fill(240, 205, 100); ellipse(35, 322, 5, 7);
    fill(150, 110, 40); ellipse(40, 337, 6, 6);
    fill(200, 180, 140); textSize(7); textAlign(CENTER); text("WAKE-UP BELL", 40, 350);
    if (srExit) { srDrawExit(200, 356); }
    var lit = srWormsLit();
    srDust();
    srDarkness(srLight.x, srLight.y, 66, srExit ? 70 : 248 - lit * 6);
    srGlowRoom1();
    for (var j = 0; j < SR_WN * SR_WN; j++) {
        if (srWormPoke[j] > 0) { srWormPoke[j]--; }
        if (srWorms[j]) { srDrawWorm(srWormX(j), srWormY(j), 1, srWormPoke[j]); }
    }
    srDrawMushroom(20, 360, 1.4, 120, 220, 255);
    srDrawMushroom(384, 300, 1.2, 120, 255, 170);
};
var srRoom1Pressed = function() {
    if (srExit) {
        if (dist(mouseX, mouseY, 200, 356) < 30) { srEnterRoom(2); }
        return;
    }
    if (dist(mouseX, mouseY, 40, 326) < 18) {
        srWorms = srWormStart.slice(0);
        shake(2);
        srSay("DING!!|(everyone panics and goes back to how they were)", 200, 380);
        return;
    }
    if (mouseX > 300 && mouseX < 382 && mouseY > 330 && mouseY < 356) { srSay("the worms wrote this sign.|they REALLY mean it.", 200, 380); return; }
    for (var i = 0; i < SR_WN * SR_WN; i++) {
        if (dist(mouseX, mouseY, srWormX(i), srWormY(i) - 6) < 21) {
            srWormToggle(i);
            srWormPoke[i] = 14;
            var wake = ["I'M UP!", "WHO TOUCHED ME", "ugh. morning.", "hi :)", "STOP POKING", "my neighbors too??", "WHY"];
            var sleep = ["five more minutes...", "zzz", "nope. bed.", "LIGHTS OUT", "goodnight forever", "mmmf"];
            if (srWorms[i]) { srSay(wake[floor(random(0, wake.length))], srWormX(i), srWormY(i) - 34); }
            else { srSay(sleep[floor(random(0, sleep.length))], srWormX(i), srWormY(i) - 34); }
            if (srWormsLit() === SR_WN * SR_WN) {
                srExit = 1;
                flash(220, 255, 150, 90);
                burst(200, 180, 220, 255, 130, 40, 3.5, 0.02);
                srSay("ALL 25 OF US ARE AWAKE. HAPPY NOW??|...the tunnel is down there. go away.", 200, 380);
            }
            return;
        }
    }
};

// ============ ROOM 2: THE BACKWARDS BAT (8 notes, fast) ============
var srBatX = 368;
var srDrawBat = function(x, y) {
    stroke(30, 22, 30); strokeWeight(2);
    line(x - 4, y, x - 4, y + 9); line(x + 4, y, x + 4, y + 9);
    noStroke();
    fill(36, 28, 42);
    triangle(x - 12, y + 10, x - 23, y + 42, x - 5, y + 36);
    triangle(x + 12, y + 10, x + 23, y + 42, x + 5, y + 36);
    stroke(26, 20, 32); strokeWeight(1);
    line(x - 13, y + 14, x - 19, y + 38); line(x + 13, y + 14, x + 19, y + 38);
    noStroke();
    fill(46, 36, 52); ellipse(x, y + 24, 26, 34);
    fill(56, 44, 62); ellipse(x, y + 26, 16, 22);
    fill(58, 46, 64); ellipse(x, y + 44, 22, 18);
    triangle(x - 10, y + 47, x - 3, y + 50, x - 10, y + 62);
    triangle(x + 10, y + 47, x + 3, y + 50, x + 10, y + 62);
    fill(220, 140, 160); triangle(x - 8.5, y + 50, x - 5, y + 51, x - 8.5, y + 57);
    triangle(x + 8.5, y + 50, x + 5, y + 51, x + 8.5, y + 57);
    fill(25, 12, 18); arc(x, y + 41, 10, 7, 180, 360);
    fill(250); triangle(x - 3.5, y + 41, x - 1.5, y + 41, x - 2.5, y + 37.5);
    triangle(x + 1.5, y + 41, x + 3.5, y + 41, x + 2.5, y + 37.5);
};
var srDrawFlyingBat = function(x, y) {
    var f = sin(frameCount * 30) * 14;
    noStroke(); fill(40, 30, 46);
    triangle(x, y, x - 30, y - 6 + f, x - 10, y + 8);
    triangle(x, y, x + 30, y - 6 + f, x + 10, y + 8);
    fill(52, 40, 58); ellipse(x, y, 16, 20);
    fill(255, 60, 60); ellipse(x - 3, y - 4, 3, 3); ellipse(x + 3, y - 4, 3, 3);
};
var srLightSpike = function(s) {
    srSpikeLit[s] = 20;
    srDrips.push({x: SR_SPIKE_X[s], y: SR_SPIKE_L[s], vy: 0, s: s});
};
var drawSrRoom2 = function() {
    srDirtWall(50, 42, 46);
    noStroke();
    srDecorRoom2();
    fill(36, 30, 34); rect(0, 0, 400, 14);
    // stalagmites + old bones on the floor
    fill(70, 60, 58);
    triangle(10, 360, 30, 360, 22, 318); triangle(150, 362, 166, 362, 160, 330); triangle(282, 362, 300, 362, 292, 326);
    triangle(352, 362, 376, 362, 366, 312);
    fill(220, 210, 190);
    rect(96, 352, 24, 4, 2); ellipse(96, 354, 6, 6); ellipse(120, 354, 6, 6);
    ellipse(214, 350, 14, 11); fill(40); ellipse(211, 349, 3, 3); ellipse(217, 349, 3, 3);
    fill(110, 80, 50); rect(330, 236, 56, 22, 2);
    fill(230, 220, 190); textSize(6); textAlign(CENTER); text("BAT CROSSING", 358, 246); text("(upside down)", 358, 254);
    for (var s = 0; s < 5; s++) {
        var x = SR_SPIKE_X[s]; var L = SR_SPIKE_L[s];
        fill(88, 74, 70); triangle(x - 15, 6, x + 15, 6, x, L);
        fill(108, 92, 86); triangle(x - 6, 6, x + 2, 6, x - 1, L - 18);
        fill(70, 58, 56); triangle(x + 4, 20, x + 10, 14, x + 3, L - 30);
        fill(40, 34, 38); ellipse(x, 336, 46, 12);
        fill(30, 40, 60); ellipse(x, 336, 36, 8);
    }
    if (srExit) { srDrawExit(45, 300); }
    if (!srBat.done || srBat.fly === 0) { srDrawBat(srBatX, 12); }
    if (srBat.play >= 0) {
        srBat.playT++;
        if (srBat.playT % SR_BAT_GAP === 1) {
            if (srBat.play < srBat.seq.length) { srLightSpike(srBat.seq[srBat.play]); srBat.play++; }
            else { srBat.play = -1; }
        }
    }
    if (srBat.done) {
        srBat.fly++;
        if (srBat.fly > 60 && srBat.fly < 150) {
            var t = (srBat.fly - 60) / 90;
            srDrawFlyingBat(srBatX + (45 - srBatX) * t, 50 + (300 - 50) * t - sin(t * 180) * 90);
        }
        if (srBat.fly === 150) {
            srExit = 1; shake(7);
            burst(45, 300, 120, 100, 90, 30, 3.5, 0.15);
            srSay("*BONK* (the bat knocked a rock out of the wall)", 200, 380);
        }
    }
    srDust();
    srDarkness(srLight.x, srLight.y, 72, 244);
    srGlowRoom2();
    for (var g = 0; g < 5; g++) {
        if (srSpikeLit[g] > 0) {
            var c = SR_SPIKE_C[g]; var a = srSpikeLit[g] * 12;
            srSpikeLit[g]--;
            fill(c[0], c[1], c[2], a * 0.3); ellipse(SR_SPIKE_X[g], SR_SPIKE_L[g] * 0.55, 60, SR_SPIKE_L[g] + 30);
            fill(c[0], c[1], c[2], a); triangle(SR_SPIKE_X[g] - 15, 6, SR_SPIKE_X[g] + 15, 6, SR_SPIKE_X[g], SR_SPIKE_L[g]);
            fill(c[0], c[1], c[2], a * 0.6); ellipse(SR_SPIKE_X[g], 336, 40, 10);
        }
    }
    for (var d = srDrips.length - 1; d >= 0; d--) {
        var dr = srDrips[d];
        dr.vy += 0.45; dr.y += dr.vy;
        var dc = SR_SPIKE_C[dr.s];
        fill(dc[0], dc[1], dc[2]); ellipse(dr.x, dr.y, 5, 7);
        if (dr.y > 334) { burst(dr.x, 334, dc[0], dc[1], dc[2], 6, 1.5, 0.1); srDrips.splice(d, 1); }
    }
    if (!srBat.done || srBat.fly === 0) {
        fill(255, 50, 50, 200 + sin(frameCount * 5) * 55);
        ellipse(srBatX - 5, 59, 4, 4); ellipse(srBatX + 5, 59, 4, 4);
    }
};
var srRoom2Pressed = function() {
    if (srExit) {
        if (dist(mouseX, mouseY, 45, 300) < 30) { srEnterRoom(3); }
        return;
    }
    if (srBat.done) { return; }
    if (dist(mouseX, mouseY, srBatX, 40) < 30) {
        if (srBat.play >= 0) { return; }
        srBat.input = [];
        srBat.play = 0; srBat.playT = 0;
        srSay(srBat.said ? "!NIAGA SIHT YALP" : "!OLLEH ...!SIHT YALP", 250, 110);
        srBat.said = 1;
        return;
    }
    if (srBat.play >= 0) { return; }
    if (dist(mouseX, mouseY, 214, 350) < 9) { srSay("hi. i'm a skull. i'm not part of the puzzle.", 200, 380); return; }
    if (mouseX > 330 && mouseX < 386 && mouseY > 236 && mouseY < 258) { srSay("the bat is upside down.|so everything it says is too.", 200, 380); return; }
    for (var s = 0; s < 5; s++) {
        var onSpike = abs(mouseX - SR_SPIKE_X[s]) < 15 && mouseY < SR_SPIKE_L[s] + 8;
        var onPuddle = dist(mouseX, mouseY, SR_SPIKE_X[s], 336) < 24;
        if (onSpike || onPuddle) {
            srLightSpike(s);
            if (!srBat.said) { return; }
            var want = srBat.seq[srBat.seq.length - 1 - srBat.input.length];
            if (s === want) {
                srBat.input.push(s);
                if (srBat.input.length === srBat.seq.length) {
                    srBat.done = 1; srBat.fly = 0;
                    flash(255, 255, 255, 60);
                    srSay("!YAY ...!UOY KNAHT", 250, 110);
                }
            } else {
                srBat.wrong++;
                srBat.input = [];
                shake(3);
                if (srBat.wrong % 3 === 0) { srSay(".SDRAWKCAB KLAT I .GNORW", 250, 110); }
                else { srSay("!GNORW", 250, 110); }
            }
            return;
        }
    }
};

// ============ ROOM 3: THE ROOT PIPES (6 x 6, get the water to the thirsty flower) ============
var srDrawFlower = function(x, y, bloom) {
    noStroke();
    var droop = bloom ? 0 : 1;
    stroke(70, 140, 60); strokeWeight(3); noFill();
    bezier(x, y + 30, x, y + 10, x + droop * 8, y, x + droop * 16, y + droop * 10);
    noStroke();
    var hx = x + droop * 16; var hy = y + droop * 10 - (bloom ? 6 : 0);
    fill(80, 160, 70); ellipse(x - 6, y + 22, 12, 6); ellipse(x + 6, y + 18, 12, 6);
    for (var p = 0; p < 6; p++) {
        if (bloom) { fill(255, 120, 170); } else { fill(150, 110, 120); }
        ellipse(hx + cos(p * 60) * (bloom ? 9 : 6), hy + sin(p * 60) * (bloom ? 9 : 6), bloom ? 11 : 7, bloom ? 11 : 7);
    }
    fill(bloom ? 255 : 170, bloom ? 220 : 150, 70); ellipse(hx, hy, 10, 10);
    fill(40); ellipse(hx - 2, hy - 1, 1.5, bloom ? 2.5 : 1); ellipse(hx + 2, hy - 1, 1.5, bloom ? 2.5 : 1);
    noFill(); stroke(40); strokeWeight(1);
    if (bloom) { arc(hx, hy + 1.5, 4, 3, 0, 180); } else { arc(hx, hy + 3, 4, 3, 180, 360); }
    noStroke();
};
var drawSrRoom3 = function() {
    srDirtWall(60, 46, 34);
    noStroke();
    srDecorRoom3();
    var N = SR_PN; var S = SR_PS;
    // the spring (where the water comes from)
    fill(40, 30, 22); ellipse(SR_PX0 - 26, SR_PY0 + S / 2, 40, 40);
    fill(70, 150, 230, 200); ellipse(SR_PX0 - 26, SR_PY0 + S / 2, 30, 30);
    fill(170, 220, 255, 150 + sin(frameCount * 6) * 80); ellipse(SR_PX0 - 30, SR_PY0 + S / 2 - 4, 8, 8);
    fill(200, 230, 255); textSize(7); textAlign(CENTER); text("SPRING", SR_PX0 - 26, SR_PY0 + S / 2 + 28);
    // the grid of roots
    for (var r = 0; r < N; r++) {
        for (var c = 0; c < N; c++) {
            var T = srPipeAt(c, r);
            var x = SR_PX0 + c * S; var y = SR_PY0 + r * S;
            var cx = x + S / 2; var cy = y + S / 2;
            fill(46, 34, 25); rect(x + 1, y + 1, S - 2, S - 2, 4);
            fill(54, 40, 30); rect(x + 3, y + 3, S - 6, S - 6, 3);
            if (T.fixed) {
                fill(110, 105, 100); ellipse(cx, cy, S - 10, S - 14);
                fill(140, 135, 128); ellipse(cx - 5, cy - 5, S - 26, S - 30);
                fill(80, 76, 72); ellipse(cx + 6, cy + 4, 5, 4);
                continue;
            }
            if (T.spin > 0) { T.spin--; }
            var dirs = [[0, -1, 1], [1, 0, 2], [0, 1, 4], [-1, 0, 8]];
            for (var k = 0; k < 4; k++) {
                if (!(T.m & dirs[k][2])) { continue; }
                var ex = cx + dirs[k][0] * S / 2; var ey = cy + dirs[k][1] * S / 2;
                stroke(110, 75, 42); strokeWeight(13); line(cx, cy, ex, ey);
                stroke(135, 95, 55); strokeWeight(9); line(cx, cy, ex, ey);
                if (T.wet) { stroke(70, 160, 240); } else { stroke(40, 26, 16); }
                strokeWeight(4); line(cx, cy, ex, ey);
            }
            noStroke();
            fill(120, 84, 48); ellipse(cx, cy, 16, 16);
            if (T.wet) { fill(110, 190, 255); } else { fill(40, 26, 16); }
            ellipse(cx, cy, 7, 7);
            if (T.spin > 0) { fill(255, 255, 255, T.spin * 20); ellipse(cx, cy, 30, 30); }
        }
    }
    // the thirsty flower at the end
    var fx = SR_PX0 + N * S + 16; var fy = SR_PY0 + (N - 1) * S + S / 2 - 30;
    fill(40, 30, 22); ellipse(fx - 6, fy + 32, 30, 10);
    srDrawFlower(fx, fy, srFlower.bloom);
    if (srPipeDone) {
        srPipeDone++;
        if (srPipeDone === 30) { srFlower.bloom = 1; burst(fx, fy, 255, 140, 190, 24, 2.5, -0.02); }
        if (srPipeDone === 120) {
            srExit = 1; shake(5);
            burst(368, 36, 120, 90, 60, 24, 3, 0.12);
            srSay("AAAAH. thank you. (the roots pull apart and open a tunnel)", 200, 386);
        }
    }
    if (srExit) { srDrawExit(368, 36); }
    srDrawMushroom(20, 380, 1.3, 120, 220, 255);
    srDrawMushroom(386, 380, 1.1, 255, 200, 120);
    srDust();
    srDarkness(srLight.x, srLight.y, 120, 175);
    srGlowRoom3();
};
var srRoom3Pressed = function() {
    if (srExit) {
        if (dist(mouseX, mouseY, 368, 36) < 28) { srEnterRoom(4); }
        return;
    }
    var N = SR_PN; var S = SR_PS;
    var fx = SR_PX0 + N * S + 16; var fy = SR_PY0 + (N - 1) * S + S / 2 - 30;
    if (dist(mouseX, mouseY, fx, fy) < 24) {
        var lines = ["so... thirsty...", "is that... a SPRING over there? i can't reach it.", "please. one sip. i'm a flower.", "...thirsty..."];
        srSay(srFlower.bloom ? "i feel AMAZING." : lines[srFlower.talk % lines.length], 200, 386);
        srFlower.talk++;
        return;
    }
    if (dist(mouseX, mouseY, SR_PX0 - 26, SR_PY0 + S / 2) < 18) { srSay("a tiny spring. it smells like the cloud from level 1.", 200, 386); return; }
    if (srPipeDone) { return; }
    var c = floor((mouseX - SR_PX0) / S); var r = floor((mouseY - SR_PY0) / S);
    if (c < 0 || r < 0 || c >= N || r >= N) { return; }
    var T = srPipeAt(c, r);
    if (T.fixed) { srSay("that's a rock. it won't turn.", 200, 386); return; }
    T.m = srRot(T.m); T.spin = 8;
    if (srPipeFlow()) {
        srPipeDone = 1;
        flash(140, 200, 255, 60);
        srSay("the water flows all the way through!!", 200, 386);
    }
};

// ============ ROOM 4: THE CROSSING (get everyone across the underground stream) ============
// the raft holds the beetle + ONE passenger. centipede + worm alone = the worm gets eaten.
// worm + mushroom alone = the mushroom gets eaten.
var SR_CROSS_NAMES = ["centipede", "worm", "mushroom"];
var srCrossReset = function() {
    srCross.side = [0, 0, 0]; srCross.raft = 0; srCross.load = -1; srCross.move = 0;
};
var srCrossRaftX = function() {
    var k = srCross.move > 0 ? srCross.move / 60 : 0;
    k = k * k * (3 - 2 * k);
    var from = srCross.raft === 0 ? 148 : 252;
    var to = srCross.raft === 0 ? 252 : 148;
    if (srCross.move > 0) { return from + (to - from) * k; }
    return from;
};
var srCrossPos = function(i) {
    if (i === srCross.load) {
        var rx = srCrossRaftX();
        return [rx - 12, 246];
    }
    var slot = [40, 82, 124];
    if (srCross.side[i] === 0) { return [slot[i], 300]; }
    return [276 + slot[i], 300];
};
var srDrawCentipede = function(x, y) {
    noStroke();
    for (var s = 0; s < 7; s++) {
        var sx = x - 18 + s * 6; var sy = y + sin(frameCount * 8 + s * 50) * 1.5;
        stroke(120, 50, 20); strokeWeight(1);
        line(sx, sy + 2, sx - 2, sy + 7); line(sx, sy + 2, sx + 2, sy + 7);
        noStroke();
        fill(s % 2 ? 210 : 180, s % 2 ? 100 : 80, 30); ellipse(sx, sy, 8, 7);
    }
    fill(160, 60, 20); ellipse(x + 23, y - 1, 10, 9);
    fill(255); ellipse(x + 25, y - 3, 3.5, 3.5);
    fill(0); ellipse(x + 26, y - 3, 1.6, 1.6);
    stroke(120, 50, 20); strokeWeight(1);
    line(x + 26, y - 5, x + 31, y - 11); line(x + 24, y - 5, x + 26, y - 12);
    noStroke();
    fill(255); triangle(x + 27, y + 2, x + 29, y + 2, x + 28, y + 4.5);
};
var srDrawWorm2 = function(x, y) {
    noStroke();
    for (var s = 0; s < 6; s++) {
        fill(235, 140, 150); ellipse(x - 12 + s * 5, y + sin(frameCount * 6 + s * 60) * 2, 8, 7);
    }
    fill(220, 120, 130); ellipse(x - 2, y, 7, 7.5);
    fill(245, 155, 165); ellipse(x + 15, y - 1, 9, 9);
    fill(0); ellipse(x + 15, y - 2, 1.6, 1.6); ellipse(x + 18, y - 2, 1.6, 1.6);
    noFill(); stroke(0); strokeWeight(0.8); arc(x + 16.5, y + 1, 4, 3, 0, 180); noStroke();
};
var srDrawShroom = function(x, y) {
    noStroke();
    fill(240, 230, 210); rect(x - 5, y - 6, 10, 12, 3);
    fill(0); ellipse(x - 2, y - 1, 1.6, 2); ellipse(x + 2, y - 1, 1.6, 2);
    noFill(); stroke(0); strokeWeight(0.8); arc(x, y + 2, 4, 2.5, 0, 180); noStroke();
    fill(210, 40, 40); arc(x, y - 6, 26, 22, 180, 360);
    fill(255); ellipse(x - 6, y - 11, 4, 3); ellipse(x + 5, y - 13, 5, 3.5); ellipse(x + 1, y - 8, 3, 2);
};
var srDrawCrossThing = function(i, x, y) {
    if (i === 0) { srDrawCentipede(x, y); }
    else if (i === 1) { srDrawWorm2(x, y); }
    else { srDrawShroom(x, y); }
};
var srDrawBeetle = function(x, y) {
    noStroke();
    // the raft
    fill(110, 75, 40); rect(x - 34, y + 6, 68, 10, 3);
    fill(90, 60, 30); for (var p = 0; p < 5; p++) { rect(x - 32 + p * 14, y + 6, 2, 10); }
    // the pole
    stroke(150, 110, 60); strokeWeight(2.5); line(x + 22, y - 30, x + 30 + sin(frameCount * 4) * 3, y + 34); noStroke();
    // the beetle ferryman
    fill(20, 60, 70); ellipse(x + 14, y - 4, 22, 20);
    fill(40, 110, 120); ellipse(x + 12, y - 8, 12, 8);
    stroke(10, 30, 36); strokeWeight(1); line(x + 14, y - 14, x + 14, y + 6); noStroke();
    fill(15, 40, 46); ellipse(x + 22, y - 12, 10, 9);
    fill(255); ellipse(x + 24, y - 14, 3, 3); fill(0); ellipse(x + 24.5, y - 14, 1.5, 1.5);
    // tiny captain's hat
    fill(250); rect(x + 17, y - 21, 11, 4, 1);
    fill(30, 30, 60); rect(x + 16, y - 18, 13, 2);
    fill(240, 200, 60); ellipse(x + 22.5, y - 19, 2.5, 2.5);
};
var drawSrRoom4Cross = function() {
    srDirtWall(54, 44, 36);
    noStroke();
    srDecorRoom4();
    // banks
    fill(72, 54, 38); rect(0, 270, 170, 130); rect(230, 270, 170, 130);
    fill(90, 68, 46); rect(0, 270, 170, 6); rect(230, 270, 170, 6);
    // the stream (rain from level 1 ended up down here)
    fill(30, 70, 140); rect(170, 262, 60, 138);
    for (var w = 0; w < 9; w++) {
        var wy = (frameCount * 2 + w * 30) % 140 + 262;
        fill(120, 190, 255, 110); rect(176 + (w * 13) % 44, wy, 10, 3, 1);
    }
    fill(30, 70, 140, 160); rect(140, 248, 120, 22);
    // the sign
    fill(110, 80, 50); rect(18, 176, 110, 36, 3);
    fill(90, 60, 35); rect(70, 212, 6, 58);
    fill(235, 225, 195); textSize(8); textAlign(CENTER);
    text("BEETLE FERRY", 73, 189); text("1 PASSENGER AT A TIME", 73, 199); text("NO EATING!!", 73, 208);
    srDrawMushroom(12, 268, 1.1, 120, 220, 255);
    srDrawMushroom(392, 268, 1.1, 255, 180, 120);
    // the raft (moving?)
    if (srCross.move > 0) {
        srCross.move++;
        if (srCross.move > 60) {
            srCross.move = 0;
            var leftBehind = srCross.raft;
            srCross.raft = 1 - srCross.raft;
            var there = [false, false, false];
            for (var i = 0; i < 3; i++) { if (i !== srCross.load && srCross.side[i] === leftBehind) { there[i] = true; } }
            if (there[0] && there[1]) {
                srSay("CHOMP. the centipede ATE the worm!!|(he spits it back out. everybody go back.)", 200, 70);
                shake(6); srCross.tries++; srCrossReset();
            } else if (there[1] && there[2]) {
                srSay("munch munch. the worm ATE the mushroom!!|(the mushroom grows back. everybody go back.)", 200, 70);
                shake(6); srCross.tries++; srCrossReset();
            } else if (srCross.load >= 0) {
                srCross.side[srCross.load] = srCross.raft;
            }
        }
    }
    var rx = srCrossRaftX();
    srDrawBeetle(rx, 248);
    for (var j = 0; j < 3; j++) {
        if (j === srCross.load && srCross.move === 0) { continue; }
        var pp = srCrossPos(j);
        if (j === srCross.load) { pp = [rx - 12, 246]; }
        srDrawCrossThing(j, pp[0], pp[1]);
    }
    if (srCross.load >= 0 && srCross.move === 0) { srDrawCrossThing(srCross.load, rx - 12, 246); }
    // everyone made it?
    if (!srCross.done && srCross.move === 0 && srCross.load < 0 &&
        srCross.side[0] === 1 && srCross.side[1] === 1 && srCross.side[2] === 1) {
        srCross.done = 1; srExit = 1;
        flash(200, 230, 255, 70);
        srSay("EVERYONE MADE IT. nobody got eaten.|the beetle: \"that'll be zero cents.\" (a tunnel opens)", 200, 70);
    }
    if (srExit) { srDrawExit(360, 150); }
    srDust();
    srDarkness(srLight.x, srLight.y, 130, 120);
    srGlowRoom4();
};
var srRoom4CrossPressed = function() {
    if (srExit) {
        if (dist(mouseX, mouseY, 360, 150) < 30) { srEnterRoom(5); }
        return;
    }
    if (srCross.move > 0) { return; }
    var rx = srCrossRaftX();
    // the beetle: cross the stream
    if (dist(mouseX, mouseY, rx + 16, 236) < 18) {
        srCross.move = 1;
        if (srCross.talk === 0) { srSay("the beetle: \"all aboard!\" *pole pole pole*", 200, 70); }
        srCross.talk++;
        return;
    }
    // unload whoever is on the raft
    if (srCross.load >= 0 && dist(mouseX, mouseY, rx - 12, 246) < 18) {
        srCross.side[srCross.load] = srCross.raft;
        srCross.load = -1;
        return;
    }
    // load someone from the bank the raft is at
    for (var i = 0; i < 3; i++) {
        if (i === srCross.load) { continue; }
        var p = srCrossPos(i);
        if (dist(mouseX, mouseY, p[0], p[1]) < 20) {
            if (srCross.side[i] !== srCross.raft) { srSay("the raft is on the other side.", 200, 70); return; }
            if (srCross.load >= 0) { srSay("the raft only fits ONE passenger. (and the beetle)", 200, 70); return; }
            srCross.load = i;
            return;
        }
    }
    if (mouseX > 170 && mouseX < 230 && mouseY > 270) { srSay("it's the rain from level 1. it ended up down here.", 200, 70); return; }
    if (mouseX > 18 && mouseX < 128 && mouseY > 176 && mouseY < 212) { srSay("the worm says it's never eaten anyone. (it has.)", 200, 70); }
};

// ============ ROOM 5: THE LYING BEETLES (only ONE of them tells the truth) ============
var SR_TUN_X = [90, 200, 310];
var srBeetleSays = function(st, i) {
    if (st.k === "mine") { return "the way out is|MY tunnel."; }
    if (st.k === "notmine") { return "the way out is|NOT my tunnel."; }
    if (st.k === "is") { return "the way out is|tunnel " + (st.d + 1) + "."; }
    return "the way out is|NOT tunnel " + (st.d + 1) + ".";
};
var srBeetleTrue = function(st, i, safe) {
    if (st.k === "mine") { return safe === i; }
    if (st.k === "notmine") { return safe !== i; }
    if (st.k === "is") { return safe === st.d; }
    return safe !== st.d;
};
// make 3 statements where exactly ONE way-out works with "exactly one beetle is telling the truth"
var srMakeBeetles = function() {
    var kinds = ["mine", "notmine", "is", "isnot"];
    for (var tries = 0; tries < 500; tries++) {
        var sts = [];
        for (var i = 0; i < 3; i++) {
            var k = kinds[floor(random(0, 4))];
            var d = floor(random(0, 3));
            if ((k === "is" || k === "isnot") && d === i) { d = (d + 1) % 3; }
            sts.push({k: k, d: d});
        }
        var answers = [];
        for (var safe = 0; safe < 3; safe++) {
            var n = 0;
            for (var b = 0; b < 3; b++) { if (srBeetleTrue(sts[b], b, safe)) { n++; } }
            if (n === 1) { answers.push(safe); }
        }
        if (answers.length === 1) {
            srBeetles = {st: sts, safe: answers[0], walk: -1, t: 0, talk: [0, 0, 0]};
            return;
        }
    }
};
var srDrawGuardBeetle = function(x, y, c) {
    noStroke();
    fill(0, 0, 0, 60); ellipse(x, y + 16, 40, 8);
    stroke(30); strokeWeight(1.5);
    line(x - 10, y + 6, x - 18, y + 16); line(x + 10, y + 6, x + 18, y + 16); line(x - 12, y, x - 20, y + 6); line(x + 12, y, x + 20, y + 6);
    noStroke();
    fill(c[0], c[1], c[2]); ellipse(x, y + 2, 30, 26);
    fill(c[0] * 0.6, c[1] * 0.6, c[2] * 0.6); rect(x - 0.8, y - 10, 1.6, 24);
    fill(255, 255, 255, 120); ellipse(x - 6, y - 4, 7, 5);
    fill(25, 25, 30); ellipse(x, y - 13, 18, 12);
    fill(255); ellipse(x - 4, y - 15, 5, 5); ellipse(x + 4, y - 15, 5, 5);
    fill(0); ellipse(x - 4, y - 15, 2, 2.5); ellipse(x + 4, y - 15, 2, 2.5);
    stroke(30); strokeWeight(1.2); line(x - 4, y - 18, x - 8, y - 26); line(x + 4, y - 18, x + 8, y - 26); noStroke();
    // a tiny guard helmet
    fill(180, 160, 90); arc(x, y - 17, 16, 10, 180, 360);
};
var SR_SUD_X = 112;
var SR_SUD_Y = 92;
var SR_SUD_S = 44;
var SR_STUMP_X = [90, 200, 310];
var SR_SC = [[230, 60, 60], [60, 130, 240], [250, 210, 50], [80, 200, 90], [200, 90, 230], [250, 150, 40]];
// ---------- extra detail for the newer underground rooms ----------
var srTorch = function(x, y) {
    noStroke();
    fill(255, 160, 60, 26 + sin(frameCount * 9 + x) * 10); ellipse(x, y - 8, 80, 80);
    fill(70, 66, 70); rect(x - 7, y + 4, 14, 5, 2);
    fill(100, 70, 40); rect(x - 3, y - 2, 6, 26, 2);
    fill(255, 130, 40); ellipse(x, y - 8 + sin(frameCount * 15 + x) * 1.5, 12, 18);
    fill(255, 210, 90); ellipse(x, y - 6, 6, 10);
    fill(255, 250, 200); ellipse(x, y - 4, 2.5, 4);
};
var srFireflies = function(n, r, g, b) {
    noStroke();
    for (var i = 0; i < n; i++) {
        var fx = (i * 97 + sin(frameCount * 1.5 + i * 40) * 30 + 400) % 400;
        var fy = 90 + (i * 61) % 260 + cos(frameCount * 2 + i * 70) * 14;
        var a = 120 + sin(frameCount * 8 + i * 50) * 100;
        fill(r, g, b, a * 0.3); ellipse(fx, fy, 10, 10);
        fill(r, g, b, a); ellipse(fx, fy, 3, 3);
    }
};
var srDecorBeetles = function() {
    noStroke();
    // tiled stone floor
    for (var t = 0; t < 10; t++) {
        fill(80 + (t % 2) * 8, 64 + (t % 2) * 6, 46); rect(t * 40, 300, 39, 18, 1);
        fill(70 + ((t + 1) % 2) * 8, 56, 40); rect(t * 40 - 20, 319, 39, 18, 1);
    }
    // stone archways around each tunnel
    for (var i = 0; i < 3; i++) {
        var x = SR_TUN_X[i];
        for (var s = 0; s < 9; s++) {
            var a = 180 + s * 22.5;
            var bx = x + cos(a) * 50; var by = 230 + sin(a) * 66;
            fill(110 + (s % 2) * 12, 100 + (s % 2) * 10, 88); ellipse(bx, by, 22, 18);
            fill(130, 120, 106); ellipse(bx - 3, by - 3, 9, 6);
        }
        fill(150, 140, 120); rect(x - 54, 290, 16, 12, 2); rect(x + 38, 290, 16, 12, 2);
    }
    srTorch(145, 200); srTorch(255, 200);
    // a little skull keystone over the middle tunnel
    fill(225, 215, 195); ellipse(200, 160, 20, 18); rect(194, 165, 12, 7, 2);
    fill(30); ellipse(196, 159, 5, 6); ellipse(204, 159, 5, 6);
};
var srDecorBeetlesFront = function() {
    // tiny spears + shields for the guards
    for (var i = 0; i < 3; i++) {
        var x = SR_TUN_X[i];
        stroke(120, 90, 50); strokeWeight(2); line(x + 20, 312, x + 24, 266); noStroke();
        fill(190, 190, 200); triangle(x + 21, 268, x + 27, 268, x + 25, 256);
        fill(150, 110, 60); ellipse(x - 20, 302, 14, 18);
        fill(200, 170, 80); ellipse(x - 20, 302, 6, 8);
    }
};
var srDecorGarden = function() {
    noStroke();
    // little fence along the back
    for (var f = 0; f < 11; f++) {
        fill(120, 90, 55); rect(10 + f * 38, 300, 8, 44, 2);
        fill(140, 108, 66); triangle(10 + f * 38, 300, 18 + f * 38, 300, 14 + f * 38, 292);
    }
    fill(120, 90, 55); rect(0, 314, 400, 6); rect(0, 332, 400, 6);
    // grass tufts
    fill(70, 130, 60);
    for (var g = 0; g < 22; g++) {
        var gx = (g * 37) % 400; var gy = 352 + (g % 3) * 12;
        triangle(gx, gy, gx + 3, gy - 10, gx + 6, gy); triangle(gx + 4, gy, gx + 9, gy - 13, gx + 11, gy);
    }
    // the wooden planter frame (with nails)
    fill(110, 76, 44); rect(SR_SUD_X - 12, SR_SUD_Y - 12, SR_SUD_S * 4 + 24, SR_SUD_S * 4 + 24, 6);
    fill(130, 92, 54); rect(SR_SUD_X - 12, SR_SUD_Y - 12, SR_SUD_S * 4 + 24, 6, 6);
    fill(190, 190, 200);
    ellipse(SR_SUD_X - 6, SR_SUD_Y - 6, 4, 4); ellipse(SR_SUD_X + SR_SUD_S * 4 + 6, SR_SUD_Y - 6, 4, 4);
    ellipse(SR_SUD_X - 6, SR_SUD_Y + SR_SUD_S * 4 + 6, 4, 4); ellipse(SR_SUD_X + SR_SUD_S * 4 + 6, SR_SUD_Y + SR_SUD_S * 4 + 6, 4, 4);
    // a watering can
    fill(90, 150, 170); rect(330, 230, 36, 30, 4);
    fill(110, 170, 190); rect(330, 230, 36, 6, 3);
    stroke(90, 150, 170); strokeWeight(4); noFill(); arc(348, 230, 26, 20, 180, 360); line(330, 248, 312, 232); noStroke();
    fill(90, 150, 170); ellipse(310, 231, 8, 6);
    fill(140, 200, 230, 160); ellipse(308, 238 + (frameCount % 30), 3, 4);
};
var srDecorJugs = function() {
    noStroke();
    // the stream on the left (fill up here)
    fill(30, 70, 140); rect(0, 120, 40, 280);
    for (var w = 0; w < 10; w++) { fill(120, 190, 255, 120); rect(6 + (w * 13) % 28, (frameCount * 2 + w * 34) % 280 + 120, 8, 3, 1); }
    fill(200, 230, 255); textSize(8); textAlign(CENTER); text("STREAM", 20, 112);
    // the drain on the right (empty here)
    fill(40, 40, 46); rect(372, 360, 28, 20, 2);
    stroke(90, 90, 100); strokeWeight(2); for (var d = 0; d < 4; d++) { line(375 + d * 7, 362, 375 + d * 7, 378); } noStroke();
    fill(200, 200, 210); textSize(8); text("DRAIN", 386, 354);
    // the toad's rock throne + lily pads + reeds
    fill(100, 96, 90); ellipse(330, 166, 110, 40);
    fill(120, 116, 108); ellipse(322, 160, 80, 22);
    fill(60, 130, 70); ellipse(270, 182, 26, 10); ellipse(380, 186, 22, 9);
    fill(240, 180, 200); ellipse(272, 180, 6, 5);
    stroke(80, 120, 60); strokeWeight(2);
    line(250, 190, 246, 140); line(256, 190, 258, 132); line(388, 190, 392, 136);
    noStroke();
    fill(120, 80, 50); ellipse(246, 140, 5, 14); ellipse(258, 132, 5, 14); ellipse(392, 136, 5, 14);
};
var srDecorJugsFront = function() {
    // glass shine + handles on the jugs
    var J = srJug;
    var xs = [96, 304]; var caps = [J.ca, J.cb];
    for (var i = 0; i < 2; i++) {
        var h = caps[i] * 16;
        noStroke();
        fill(255, 255, 255, 70); rect(xs[i] - 20, 300 - h + 6, 5, h - 12, 3);
        noFill(); stroke(220, 230, 245, 200); strokeWeight(3);
        arc(xs[i] + 28, 300 - h / 2, 18, min(60, h * 0.6), -90, 90);
        noStroke();
    }
};
var srDecorAcorns = function() {
    noStroke();
    // big tree roots across the back wall
    stroke(90, 62, 36); strokeWeight(14); noFill();
    bezier(-10, 120, 80, 100, 140, 180, 220, 150);
    bezier(410, 110, 330, 140, 280, 90, 230, 160);
    stroke(110, 78, 46); strokeWeight(6);
    bezier(-10, 120, 80, 100, 140, 180, 220, 150);
    noStroke(); strokeWeight(1);
    // falling leaves
    for (var l = 0; l < 6; l++) {
        var lx = (l * 71 + sin(frameCount * 2 + l * 60) * 20 + 400) % 400;
        var ly = (frameCount * 0.8 + l * 70) % 400;
        fill(l % 2 ? 200 : 170, l % 2 ? 120 : 90, 40, 200);
        ellipse(lx, ly, 10, 5); fill(120, 70, 30); rect(lx - 0.5, ly, 1, 4);
    }
};
var srDecorStumpRings = function() {
    noFill(); stroke(90, 62, 36); strokeWeight(1);
    for (var p = 0; p < 3; p++) {
        var x = SR_STUMP_X[p];
        ellipse(x, 300, 70, 13); ellipse(x, 300, 46, 8);
    }
    noStroke();
};
var srDrawSquirrel = function(x, y) {
    noStroke();
    // big curly tail
    fill(170, 95, 40); ellipse(x + 20, y - 6, 30, 58);
    fill(195, 120, 55); ellipse(x + 24, y - 30, 26, 24);
    fill(150, 80, 30); ellipse(x + 24, y - 30, 12, 10);
    // body + head
    fill(165, 92, 42); ellipse(x, y + 4, 30, 40);
    fill(225, 190, 150); ellipse(x - 3, y + 8, 16, 24);
    fill(165, 92, 42); ellipse(x - 2, y - 22, 26, 24);
    triangle(x - 12, y - 30, x - 8, y - 44, x - 3, y - 32); triangle(x + 2, y - 32, x + 6, y - 44, x + 9, y - 30);
    fill(230, 150, 150); triangle(x - 10, y - 32, x - 8, y - 40, x - 5, y - 33);
    fill(20); ellipse(x - 8, y - 24, 5, 6); ellipse(x + 3, y - 24, 5, 6);
    fill(255); ellipse(x - 9, y - 26, 2, 2); ellipse(x + 2, y - 26, 2, 2);
    fill(60, 30, 20); ellipse(x - 3, y - 17, 5, 4);
    stroke(60, 40, 30); strokeWeight(0.8);
    line(x - 6, y - 17, x - 18, y - 19); line(x - 6, y - 16, x - 18, y - 14); line(x, y - 17, x + 10, y - 19);
    noStroke();
    // holding a tiny acorn
    fill(170, 110, 50); ellipse(x - 6, y - 4, 10, 10);
    fill(110, 75, 35); arc(x - 6, y - 6, 11, 8, 180, 360);
    fill(165, 92, 42); ellipse(x - 12, y - 2, 8, 6); ellipse(x, y - 2, 8, 6);
};
var srDecorSnail = function() {
    noStroke();
    // carvings of colored dots on the wall (old code guesses?)
    for (var c = 0; c < 6; c++) {
        var cc = SR_SC[c];
        fill(cc[0] * 0.4, cc[1] * 0.4, cc[2] * 0.4); ellipse(320 + (c % 3) * 22, 100 + floor(c / 3) * 22, 14, 14);
    }
    fill(90, 80, 90); textSize(7); textAlign(CENTER); text("(the 6 colors)", 342, 140);
    srDrawMushroom(14, 380, 1.3, 120, 220, 255);
    srDrawMushroom(386, 230, 1.1, 230, 120, 255);
    // the slime trail
    fill(180, 220, 200, 70 + sin(frameCount * 4) * 30);
    rect(200, 336, 150, 6, 3);
    fill(240, 255, 250, 120); ellipse(240 + (frameCount % 60), 338, 6, 3);
};
var srDrawBigSnail = function(x, y, open) {
    noStroke();
    // body
    fill(180, 165, 125); ellipse(x - 6, y + 28, 92, 26);
    fill(200, 185, 145); ellipse(x - 34, y + 20, 26, 34);
    fill(160, 145, 108); ellipse(x - 6, y + 34, 80, 10);
    stroke(180, 165, 125); strokeWeight(3); line(x - 40, y + 6, x - 50, y - 18); line(x - 32, y + 6, x - 34, y - 20); noStroke();
    fill(30); ellipse(x - 50, y - 19, 7, 7); ellipse(x - 34, y - 21, 7, 7);
    fill(255); ellipse(x - 51, y - 21, 2.5, 2.5); ellipse(x - 35, y - 23, 2.5, 2.5);
    noFill(); stroke(80, 60, 40); strokeWeight(1.5); arc(x - 40, y + 22, 10, 6, 0, 180); noStroke();
    // the shell (it's the safe)
    fill(120, 84, 52); ellipse(x + 8, y, 76, 72);
    fill(150, 108, 66); ellipse(x + 4, y - 4, 60, 56);
    fill(170, 126, 78); ellipse(x + 2, y - 6, 40, 38);
    fill(190, 146, 92); ellipse(x, y - 8, 20, 19);
    noFill(); stroke(100, 70, 42); strokeWeight(2);
    arc(x + 8, y, 60, 56, 200, 520); arc(x + 4, y - 4, 40, 38, 200, 500);
    noStroke();
    fill(255, 255, 255, 60); ellipse(x - 12, y - 20, 16, 10);
    // the safe dial on the shell
    fill(70, 70, 76); ellipse(x + 26, y + 16, 22, 22);
    fill(190, 190, 200); ellipse(x + 26, y + 16, 16, 16);
    stroke(60); strokeWeight(1.5); line(x + 26, y + 16, x + 26 + cos(frameCount * 2) * 6, y + 16 + sin(frameCount * 2) * 6); noStroke();
    fill(220, 190, 80); rect(x + 4, y - 40, 30, 10, 2);
    fill(60, 40, 10); textSize(7); textAlign(CENTER); text("SAFE", x + 19, y - 32);
    if (open) { fill(255, 230, 120, 120); ellipse(x + 8, y, 90, 86); }
};

var drawSrRoom5Beetles = function() {
    if (srBeetles.st.length === 0) { srMakeBeetles(); }
    srDirtWall(58, 46, 36);
    noStroke();
    fill(72, 56, 40); rect(0, 300, 400, 100);
    srDecorBeetles();
    var cols = [[200, 60, 60], [60, 140, 200], [90, 180, 80]];
    for (var i = 0; i < 3; i++) {
        var x = SR_TUN_X[i];
        fill(40, 28, 20); ellipse(x, 228, 86, 120);
        fill(10, 6, 4); ellipse(x, 236, 70, 100);
        fill(220, 200, 150); textSize(11); textAlign(CENTER); text("TUNNEL " + (i + 1), x, 160);
        srDrawGuardBeetle(x, 300, cols[i]);
        // the speech bubble
        var said = srBeetleSays(srBeetles.st[i], i);
        var parts = said.split("|");
        fill(245, 235, 210); rect(x - 50, 318, 100, 34, 5);
        triangle(x - 6, 318, x + 6, 318, x, 311);
        fill(50, 35, 20); textSize(10); textAlign(CENTER);
        text(parts[0], x, 332); text(parts[1], x, 346);
    }
    srDecorBeetlesFront();
    // the rule sign
    fill(110, 80, 50); rect(110, 62, 180, 40, 3);
    fill(240, 230, 200); textSize(10); textAlign(CENTER);
    text("ONLY ONE OF US", 200, 78); text("TELLS THE TRUTH.", 200, 92);
    fill(200, 180, 140); textSize(8); text("(the other two are LIARS)", 200, 116);
    if (srBeetles.walk >= 0) {
        srBeetles.t++;
        var wx = SR_TUN_X[srBeetles.walk];
        fill(0, 0, 0, min(255, srBeetles.t * 5)); ellipse(wx, 236, 70, 100);
        if (srBeetles.t === 50) {
            if (srBeetles.walk === srBeetles.safe) {
                srEnterRoom(6);
                srSay("the tunnel keeps going! (the beetles salute you)", 200, 386);
                return;
            }
            shake(5);
            srSay("DEAD END. *bonk*|(the beetles giggle and swap everything around)", 200, 386);
            srMakeBeetles();
        }
    }
    srDust();
    srDarkness(srLight.x, srLight.y, 140, 120);
};
var srRoom5BeetlesPressed = function() {
    if (srBeetles.walk >= 0 && srBeetles.t < 50) { return; }
    for (var i = 0; i < 3; i++) {
        if (dist(mouseX, mouseY, SR_TUN_X[i], 232) < 40) {
            srBeetles.walk = i; srBeetles.t = 0;
            return;
        }
        if (dist(mouseX, mouseY, SR_TUN_X[i], 300) < 20) {
            var lines = ["...", "i'm not telling you which one i am.", "trust me. or don't. (heh)", "*clicks pincers*"];
            srSay(lines[srBeetles.talk[i] % lines.length], SR_TUN_X[i], 386);
            srBeetles.talk[i]++;
            return;
        }
    }
};

// ============ ROOM 6: THE MUSHROOM GARDEN (4 x 4 mushroom sudoku) ============
var SR_MC = [[220, 50, 50], [60, 120, 230], [240, 200, 40], [170, 70, 220]];
var srSudOk = function(g, i, v) {
    var r = floor(i / 4); var c = i % 4;
    var br = floor(r / 2) * 2; var bc = floor(c / 2) * 2;
    for (var k = 0; k < 4; k++) {
        if (k !== c && g[r * 4 + k] === v) { return false; }
        if (k !== r && g[k * 4 + c] === v) { return false; }
    }
    for (var a = br; a < br + 2; a++) {
        for (var b = bc; b < bc + 2; b++) {
            if ((a !== r || b !== c) && g[a * 4 + b] === v) { return false; }
        }
    }
    return true;
};
var srSudCount = function(g, limit) {
    // how many ways can this garden be finished? (stops at limit)
    for (var i = 0; i < 16; i++) {
        if (g[i] === 0) {
            var n = 0;
            for (var v = 1; v <= 4; v++) {
                if (srSudOk(g, i, v)) {
                    g[i] = v;
                    n += srSudCount(g, limit - n);
                    g[i] = 0;
                    if (n >= limit) { return n; }
                }
            }
            return n;
        }
    }
    return 1;
};
var srMakeSudoku = function() {
    var base = [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1];
    var perm = [1, 2, 3, 4];
    for (var p = 3; p > 0; p--) { var j = floor(random(0, p + 1)); var t = perm[p]; perm[p] = perm[j]; perm[j] = t; }
    var g = [];
    for (var i = 0; i < 16; i++) { g.push(perm[base[i] - 1]); }
    // shuffle rows inside each band, columns inside each stack, and maybe flip it
    var swapRows = function(a, b) { for (var c = 0; c < 4; c++) { var t2 = g[a * 4 + c]; g[a * 4 + c] = g[b * 4 + c]; g[b * 4 + c] = t2; } };
    var swapCols = function(a, b) { for (var r = 0; r < 4; r++) { var t3 = g[r * 4 + a]; g[r * 4 + a] = g[r * 4 + b]; g[r * 4 + b] = t3; } };
    if (random(0, 1) < 0.5) { swapRows(0, 1); }
    if (random(0, 1) < 0.5) { swapRows(2, 3); }
    if (random(0, 1) < 0.5) { swapCols(0, 1); }
    if (random(0, 1) < 0.5) { swapCols(2, 3); }
    if (random(0, 1) < 0.5) { swapRows(0, 2); swapRows(1, 3); }
    if (random(0, 1) < 0.5) { swapCols(0, 2); swapCols(1, 3); }
    var sol = g.slice(0);
    // pull out as many mushrooms as possible while the answer stays the only answer
    var order = [];
    for (var o = 0; o < 16; o++) { order.push(o); }
    for (var q = 15; q > 0; q--) { var j2 = floor(random(0, q + 1)); var t4 = order[q]; order[q] = order[j2]; order[j2] = t4; }
    for (var z = 0; z < 16; z++) {
        var keep = g[order[z]];
        g[order[z]] = 0;
        if (srSudCount(g.slice(0), 2) !== 1) { g[order[z]] = keep; }
    }
    srSud = {sol: sol, given: g.slice(0), cell: g.slice(0), done: 0};
};
var srDrawGardenShroom = function(x, y, k, s) {
    var c = SR_MC[k - 1];
    noStroke();
    fill(c[0], c[1], c[2], 40); ellipse(x, y, 34 * s, 30 * s);
    fill(235, 225, 205); rect(x - 4 * s, y - 2 * s, 8 * s, 12 * s, 2);
    fill(c[0], c[1], c[2]); arc(x, y - 2 * s, 28 * s, 24 * s, 180, 360);
    fill(255, 255, 255, 200);
    ellipse(x - 6 * s, y - 8 * s, 4 * s, 3 * s); ellipse(x + 5 * s, y - 10 * s, 5 * s, 3.5 * s); ellipse(x + 1, y - 5 * s, 3 * s, 2 * s);
};
var drawSrRoom6Garden = function() {
    if (srSud.cell.length === 0) { srMakeSudoku(); }
    srDirtWall(52, 46, 34);
    noStroke();
    srDecorGarden();
    fill(110, 80, 50); rect(60, 30, 280, 46, 3);
    fill(240, 230, 200); textSize(9); textAlign(CENTER);
    text("EVERY ROW, EVERY COLUMN, AND EVERY", 200, 46);
    text("BOX OF 4 NEEDS ONE OF EACH MUSHROOM.", 200, 58);
    fill(200, 180, 140); textSize(7); text("(the stone-ringed ones are planted. don't touch.)", 200, 70);
    for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
            var i = r * 4 + c;
            var x = SR_SUD_X + c * SR_SUD_S; var y = SR_SUD_Y + r * SR_SUD_S;
            fill(66, 50, 34); rect(x + 1, y + 1, SR_SUD_S - 2, SR_SUD_S - 2, 4);
            fill(80, 62, 42); rect(x + 4, y + 4, SR_SUD_S - 8, SR_SUD_S - 8, 3);
            if (srSud.given[i]) { noFill(); stroke(150, 145, 135); strokeWeight(3); ellipse(x + SR_SUD_S / 2, y + SR_SUD_S / 2 + 2, 36, 32); noStroke(); }
            if (srSud.cell[i]) { srDrawGardenShroom(x + SR_SUD_S / 2, y + SR_SUD_S / 2 + 4, srSud.cell[i], 1); }
        }
    }
    // thick lines between the 4 boxes
    fill(30, 22, 14);
    rect(SR_SUD_X + 2 * SR_SUD_S - 2, SR_SUD_Y, 4, 4 * SR_SUD_S);
    rect(SR_SUD_X, SR_SUD_Y + 2 * SR_SUD_S - 2, 4 * SR_SUD_S, 4);
    fill(200, 180, 140); textSize(8); textAlign(CENTER);
    text("(click a patch to plant / change a mushroom)", 200, SR_SUD_Y + 4 * SR_SUD_S + 16);
    if (srExit) { srDrawExit(200, 360); }
    srFireflies(8, 200, 255, 150);
    srDust();
    srDarkness(srLight.x, srLight.y, 150, 110);
};
var srRoom6GardenPressed = function() {
    if (srExit) {
        if (dist(mouseX, mouseY, 200, 360) < 30) { srEnterRoom(7); }
        return;
    }
    var c = floor((mouseX - SR_SUD_X) / SR_SUD_S); var r = floor((mouseY - SR_SUD_Y) / SR_SUD_S);
    if (c < 0 || r < 0 || c > 3 || r > 3) { return; }
    var i = r * 4 + c;
    if (srSud.given[i]) { srSay("that one's planted in stone. it stays.", 200, 386); return; }
    srSud.cell[i] = (srSud.cell[i] + 1) % 5;
    var full = true; var ok = true;
    for (var k = 0; k < 16; k++) {
        if (!srSud.cell[k]) { full = false; }
        else if (!srSudOk(srSud.cell, k, srSud.cell[k])) { ok = false; }
    }
    if (full && ok) {
        srExit = 1;
        flash(200, 255, 200, 70);
        burst(200, 180, 255, 200, 120, 40, 3.5, 0);
        srSay("the garden is PERFECT. the mushrooms open a tunnel for you.", 200, 386);
    } else if (full) {
        srSay("hmm. some mushrooms are next to their twins.", 200, 386);
    }
};

// ============ ROOM 7: THE TOAD'S JUGS (measure EXACTLY the right amount) ============
var srDrawToad = function(x, y, happy) {
    noStroke();
    fill(0, 0, 0, 60); ellipse(x, y + 26, 90, 14);
    fill(120, 140, 60); ellipse(x, y + 6, 86, 52);
    fill(150, 170, 80); ellipse(x, y + 14, 60, 30);
    fill(100, 120, 50);
    ellipse(x - 30, y - 8, 10, 8); ellipse(x + 26, y - 2, 12, 9); ellipse(x - 6, y - 14, 9, 7);
    // eyes on top
    fill(120, 140, 60); ellipse(x - 20, y - 18, 24, 22); ellipse(x + 20, y - 18, 24, 22);
    fill(255, 220, 60); ellipse(x - 20, y - 19, 16, 14); ellipse(x + 20, y - 19, 16, 14);
    fill(0); ellipse(x - 20, y - 19, 12, happy ? 9 : 4); ellipse(x + 20, y - 19, 12, happy ? 9 : 4);
    // little crown (he's the TOAD KING)
    fill(240, 200, 50);
    triangle(x - 14, y - 32, x - 8, y - 46, x - 2, y - 32); triangle(x - 4, y - 32, x + 2, y - 50, x + 8, y - 32); triangle(x + 6, y - 32, x + 12, y - 46, x + 18, y - 32);
    rect(x - 14, y - 34, 32, 6, 1);
    fill(220, 40, 60); ellipse(x + 2, y - 31, 4, 4);
    // mouth
    noFill(); stroke(60, 70, 30); strokeWeight(2);
    if (happy) { arc(x, y, 40, 18, 0, 180); } else { arc(x, y + 8, 30, 10, 180, 360); }
    noStroke();
};
var srDrawJug = function(x, y, cap, amt, label) {
    var h = cap * 16;
    noStroke();
    fill(200, 220, 240, 60); rect(x - 26, y - h, 52, h, 6);
    fill(60, 140, 230, 200); rect(x - 24, y - amt * 16, 48, amt * 16, 4);
    if (amt > 0) { fill(150, 200, 255, 200); rect(x - 24, y - amt * 16, 48, 3); }
    noFill(); stroke(220, 230, 245); strokeWeight(2.5); rect(x - 26, y - h, 52, h, 6); noStroke();
    stroke(220, 230, 245, 140); strokeWeight(1);
    for (var m = 1; m < cap; m++) { line(x - 26, y - m * 16, x - 18, y - m * 16); }
    noStroke();
    fill(255); textSize(13); textAlign(CENTER); text(amt + " / " + cap, x, y + 18);
    fill(200, 190, 160); textSize(9); text(label, x, y - h - 8);
};
var srJugButtons = function() {
    // [x, y, w, h, action]
    return [[66, 330, 60, 20, "fillA"], [66, 356, 60, 20, "emptyA"], [174, 214, 52, 20, "AtoB"], [174, 244, 52, 20, "BtoA"],
            [274, 330, 60, 20, "fillB"], [274, 356, 60, 20, "emptyB"]];
};
var drawSrRoom7Jugs = function() {
    srDirtWall(54, 48, 38);
    noStroke();
    srDecorJugs();
    var J = srJug;
    fill(110, 80, 50); rect(70, 30, 260, 40, 3);
    fill(240, 230, 200); textSize(10); textAlign(CENTER);
    text("THE TOAD KING WANTS EXACTLY " + J.goal + " CUPS.", 200, 46);
    fill(200, 180, 140); textSize(8); text("(no guessing. no spilling. no ripples.)", 200, 60);
    srDrawToad(330, 132, J.done);
    srDrawJug(96, 300, J.ca, J.a, "JUG A");
    srDrawJug(304, 300, J.cb, J.b, "JUG B");
    srDecorJugsFront();
    var btns = srJugButtons();
    var labels = {fillA: "FILL", emptyA: "EMPTY", AtoB: "A  >>  B", BtoA: "A  <<  B", fillB: "FILL", emptyB: "EMPTY"};
    for (var i = 0; i < btns.length; i++) {
        var B = btns[i];
        fill(70, 52, 34); rect(B[0], B[1], B[2], B[3], 4);
        fill(240, 230, 200); textSize(9); textAlign(CENTER); text(labels[B[4]], B[0] + B[2] / 2, B[1] + 14);
    }
    fill(200, 190, 160); textSize(9); text("pours: " + J.moves, 200, 300);
    if (J.done) {
        J.done++;
        if (J.done === 60) { srExit = 1; burst(200, 150, 120, 200, 80, 20, 3, 0.1); }
    }
    if (srExit) { srDrawExit(200, 150); }
    srDust();
    srDarkness(srLight.x, srLight.y, 150, 110);
};
var srRoom7JugsPressed = function() {
    var J = srJug;
    if (srExit) {
        if (dist(mouseX, mouseY, 200, 150) < 30) { srEnterRoom(8); }
        return;
    }
    if (J.done) { return; }
    if (dist(mouseX, mouseY, 330, 132) < 40) {
        srSay("ribbit. EXACTLY " + J.goal + " cups. not " + (J.goal - 1) + ". not " + (J.goal + 1) + ". " + J.goal + ".", 200, 386);
        return;
    }
    var btns = srJugButtons();
    for (var i = 0; i < btns.length; i++) {
        var B = btns[i];
        if (mouseX > B[0] && mouseX < B[0] + B[2] && mouseY > B[1] && mouseY < B[1] + B[3]) {
            var act = B[4];
            if (act === "fillA") { J.a = J.ca; }
            if (act === "fillB") { J.b = J.cb; }
            if (act === "emptyA") { J.a = 0; }
            if (act === "emptyB") { J.b = 0; }
            if (act === "AtoB") { var p1 = min(J.a, J.cb - J.b); J.a -= p1; J.b += p1; }
            if (act === "BtoA") { var p2 = min(J.b, J.ca - J.a); J.b -= p2; J.a += p2; }
            J.moves++;
            if (J.a === J.goal || J.b === J.goal) {
                J.done = 1;
                flash(150, 220, 255, 60);
                srSay("*GULP GULP GULP* \"PERFECT.\" the Toad King lets you pass.", 200, 386);
            }
            return;
        }
    }
};

// ============ ROOM 8: THE ACORN TOWER (move all 5 acorns to the last stump) ============
var srDrawAcorn = function(x, y, size, held) {
    var w = 26 + size * 14;
    noStroke();
    fill(0, 0, 0, held ? 30 : 50); ellipse(x, y + 10, w, 6);
    fill(170, 110, 50); ellipse(x, y, w, 20);
    fill(195, 135, 70); ellipse(x - w * 0.15, y - 3, w * 0.5, 7);
    fill(110, 75, 35); arc(x, y - 4, w * 0.9, 16, 180, 360);
    stroke(80, 52, 22); strokeWeight(0.8);
    for (var cx = -w * 0.35; cx < w * 0.35; cx += 5) { line(x + cx, y - 10, x + cx + 3, y - 5); }
    noStroke();
    fill(90, 60, 25); rect(x - 1.5, y - 16, 3, 6);
};
var drawSrRoom8Acorns = function() {
    srDirtWall(60, 50, 36);
    noStroke();
    srDecorAcorns();
    var H = srHanoi;
    fill(110, 80, 50); rect(60, 30, 280, 46, 3);
    fill(240, 230, 200); textSize(10); textAlign(CENTER);
    text("MOVE ALL MY ACORNS TO THE LAST STUMP.", 200, 46);
    text("ONE AT A TIME. NEVER BIG ON SMALL.", 200, 60);
    fill(200, 180, 140); textSize(8); text("- the squirrel (the best anyone ever did it was 31 moves)", 200, 92);
    srDrawSquirrel(362, 160);
    for (var p = 0; p < 3; p++) {
        var x = SR_STUMP_X[p];
        fill(90, 62, 36); rect(x - 46, 300, 92, 30, 4);
        fill(130, 92, 52); ellipse(x, 300, 92, 18);
        fill(110, 78, 44); ellipse(x, 300, 60, 10);
        fill(100, 70, 40); rect(x - 3, 190, 6, 110);
        for (var k = 0; k < H.peg[p].length; k++) {
            srDrawAcorn(x, 286 - k * 22, H.peg[p][k], false);
        }
    }
    srDecorStumpRings();
    if (H.held >= 0) { srDrawAcorn(mouseX, mouseY, H.held, true); }
    fill(200, 190, 160); textSize(10); textAlign(CENTER); text("moves: " + H.moves, 200, 352);
    if (srExit) { srDrawExit(200, 150); }
    srDust();
    srDarkness(srLight.x, srLight.y, 150, 100);
};
var srRoom8AcornsPressed = function() {
    var H = srHanoi;
    if (srExit) {
        if (dist(mouseX, mouseY, 200, 150) < 30) { srEnterRoom(9); }
        return;
    }
    for (var p = 0; p < 3; p++) {
        if (abs(mouseX - SR_STUMP_X[p]) < 52 && mouseY > 150 && mouseY < 336) {
            var pg = H.peg[p];
            if (H.held < 0) {
                if (pg.length === 0) { return; }
                H.held = pg.pop(); H.from = p;
            } else {
                if (pg.length > 0 && pg[pg.length - 1] < H.held) {
                    srSay("NO! big acorns never go on small ones. (the squirrel gasps)", 200, 386);
                    return;
                }
                pg.push(H.held);
                if (p !== H.from) { H.moves++; }
                H.held = -1;
                if (H.peg[2].length === 5) {
                    srExit = 1;
                    flash(255, 220, 150, 60);
                    srSay(H.moves <= 31 ? "31 MOVES?! that's PERFECT. the squirrel faints." : "all moved! (" + H.moves + " moves) the squirrel digs you a tunnel.", 200, 386);
                }
            }
            return;
        }
    }
};

// ============ ROOM 9: THE SNAIL SAFE (crack the 4-color code in 10 tries) ============
var srMindScore = function(guess, code) {
    var gold = 0; var silver = 0;
    var cg = [0, 0, 0, 0, 0, 0]; var cc = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 4; i++) {
        if (guess[i] === code[i]) { gold++; }
        else { cg[guess[i]]++; cc[code[i]]++; }
    }
    for (var c = 0; c < 6; c++) { silver += min(cg[c], cc[c]); }
    return [gold, silver];
};
var drawSrRoom9Snail = function() {
    srDirtWall(48, 42, 44);
    noStroke();
    srDecorSnail();
    var M = srMind;
    fill(110, 80, 50); rect(20, 20, 360, 44, 3);
    fill(240, 230, 200); textSize(9); textAlign(CENTER);
    text("CRACK MY 4-COLOR CODE. YOU GET 10 TRIES.  (colors can repeat)", 200, 36);
    fill(255, 215, 70); text("GOLD dot = right color, right spot.", 120, 54);
    fill(210, 210, 220); text("SILVER dot = right color, wrong spot.", 290, 54);
    srDrawBigSnail(350, 298, M.done);
    // past guesses
    for (var g = 0; g < M.guesses.length; g++) {
        var gy = 82 + g * 22;
        for (var s = 0; s < 4; s++) { var c = SR_SC[M.guesses[g][s]]; fill(c[0], c[1], c[2]); ellipse(60 + s * 22, gy, 16, 16); }
        var fb = M.fb[g];
        for (var d = 0; d < 4; d++) {
            var dx = 160 + (d % 2) * 9; var dy = gy - 4 + floor(d / 2) * 8;
            if (d < fb[0]) { fill(255, 215, 70); }
            else if (d < fb[0] + fb[1]) { fill(210, 210, 220); }
            else { fill(40, 34, 30); }
            ellipse(dx, dy, 6, 6);
        }
        fill(150, 140, 120); textSize(8); textAlign(RIGHT); text((g + 1) + ".", 44, gy + 3);
    }
    // the guess you're building
    if (!M.done) {
        fill(30, 26, 24); rect(196, 300, 104, 34, 6);
        for (var t = 0; t < 4; t++) {
            var tc = SR_SC[M.cur[t]];
            fill(tc[0], tc[1], tc[2]); ellipse(212 + t * 24, 317, 20, 20);
            fill(255, 255, 255, 120); ellipse(209 + t * 24, 313, 5, 4);
        }
        fill(200, 60, 50); rect(212, 342, 72, 20, 4);
        fill(255); textSize(10); textAlign(CENTER); text("TRY IT", 248, 356);
        fill(200, 190, 160); textSize(8); text("(click a color to change it)", 248, 296);
        text("tries left: " + (10 - M.guesses.length), 248, 380);
    }
    if (srExit) { srDrawExit(260, 200); }
    srDust();
    srDarkness(srLight.x, srLight.y, 160, 90);
};
var srRoom9SnailPressed = function() {
    var M = srMind;
    if (srExit) {
        if (dist(mouseX, mouseY, 260, 200) < 30) { srEnterRoom(12); }
        return;
    }
    if (M.done) { return; }
    for (var t = 0; t < 4; t++) {
        if (dist(mouseX, mouseY, 212 + t * 24, 317) < 12) { M.cur[t] = (M.cur[t] + 1) % 6; return; }
    }
    if (mouseX > 212 && mouseX < 284 && mouseY > 342 && mouseY < 362) {
        var sc = srMindScore(M.cur, M.code);
        M.guesses.push(M.cur.slice(0)); M.fb.push(sc);
        if (sc[0] === 4) {
            M.done = 1; srExit = 1;
            flash(255, 230, 150, 80);
            srSay("*CLICK* the snail's shell swings open. \"...fine. you can pass.\"", 200, 386);
        } else if (M.guesses.length >= 10) {
            shake(5);
            srSay("OUT OF TRIES. the snail spins its shell... it's a NEW code now.", 200, 386);
            M.code = [floor(random(0, 6)), floor(random(0, 6)), floor(random(0, 6)), floor(random(0, 6))];
            M.guesses = []; M.fb = [];
        }
        return;
    }
    if (dist(mouseX, mouseY, 352, 300) < 34) { srSay("\"i'm a safe. i don't talk.\" (it talked)", 200, 386); }
};

// ============ ROOM 10: THE DOOR (5 digits) ============
var srDrawPinDigit = function(d, x, y, a, sz) {
    var pat = SR_DIGITS[d];
    for (var k = 0; k < 15; k++) {
        if (pat.charAt(k) === "1") {
            var px = x + (k % 3) * 8; var py = y + floor(k / 3) * 7;
            if (a > 40) { fill(255, 245, 190, a * 0.25); ellipse(px, py, sz * 4, sz * 4); }
            fill(255, 250, 215, a); ellipse(px, py, sz, sz);
        }
    }
};
var srDrawPinDots = function(n, x, y, a, sz) {
    for (var k = 0; k < n; k++) {
        var px = x + 7 - (n - 1) * 2.5 + k * 5;
        fill(255, 220, 140, a); ellipse(px, y, sz, sz);
    }
};
var drawSrRoom4 = function() {
    srDirtWall(70, 55, 44);
    noStroke();
    var X = SR_DOOR_X; var Y = SR_DOOR_Y;
    // stone arch with moss + runes
    fill(58, 48, 42); ellipse(X, Y, 250, 250);
    fill(75, 64, 56); ellipse(X, Y, 236, 236);
    fill(70, 110, 60, 160);
    for (var mo = 0; mo < 9; mo++) { ellipse(X + cos(200 + mo * 16) * 118, Y + sin(200 + mo * 16) * 118, 14, 9); }
    stroke(110, 95, 80); strokeWeight(1.5);
    for (var ru = 0; ru < 10; ru++) {
        var ra = 205 + ru * 13;
        var rx = X + cos(ra) * 112; var ry = Y + sin(ra) * 112;
        line(rx - 2, ry - 3, rx + 2, ry + 3); line(rx + 2, ry - 3, rx - 2, ry + 1);
    }
    noStroke();
    if (!srDoor.open) {
        fill(118, 78, 44); ellipse(X, Y, 212, 212);
        stroke(92, 58, 30); strokeWeight(2);
        for (var px = X - 88; px <= X + 88; px += 22) {
            var hh = sqrt(max(0, 106 * 106 - (px - X) * (px - X)));
            line(px, Y - hh + 2, px, Y + hh - 2);
        }
        stroke(100, 64, 34); strokeWeight(1);
        for (var gr = 0; gr < 8; gr++) { var gx = X - 80 + gr * 22 + 7; line(gx, Y - 40 + gr * 6, gx + 3, Y + 10 + gr * 4); }
        noFill(); stroke(190, 150, 70); strokeWeight(6); ellipse(X, Y, 212, 212);
        stroke(150, 115, 50); strokeWeight(2); ellipse(X, Y, 200, 200);
        noStroke();
        fill(170, 140, 80);
        for (var r = 0; r < 12; r++) { ellipse(X + cos(r * 30) * 106, Y + sin(r * 30) * 106, 5, 5); }
        // iron hinges
        fill(60, 60, 66); rect(X - 110, Y - 50, 30, 10, 2); rect(X - 110, Y + 40, 30, 10, 2);
        textSize(10); textAlign(CENTER);
        fill(150, 110, 70); text("I KNOW THE PASSWORD.", X + 1, Y - 79);
        text("IT'S INSIDE ME.", X + 1, Y - 66);
        fill(60, 34, 16); text("I KNOW THE PASSWORD.", X, Y - 80);
        text("IT'S INSIDE ME.", X, Y - 67);
        for (var q = 0; q < 5; q++) {
            srDrawPinDigit(srDoor.code[q], SR_PIN_X[q], SR_PIN_Y, 20, 1.5);
        }
        fill(180, 145, 70); ellipse(X, Y + 4, 26, 30);
        fill(12, 8, 6); ellipse(X, Y + 8, 10, 10); triangle(X - 4.6, Y + 6, X + 4.6, Y + 6, X, Y - 6);
        noFill(); stroke(200, 165, 80); strokeWeight(4); ellipse(X, Y + 72, 26, 26);
        noStroke(); fill(170, 135, 60); ellipse(X, Y + 58, 10, 8);
    } else {
        srDoor.open++;
        var op = min(1, srDoor.open / 80);
        fill(255, 248, 220); ellipse(X, Y, 212, 212);
        fill(255, 255, 240, 120); ellipse(X, Y, 260 + op * 80, 260 + op * 80);
        fill(118, 78, 44); ellipse(X - 106 + 20 * (1 - op), Y, 40 * (1 - op) + 18, 212);
        if (srDoor.open > 120) { srEnterRoom(11); return; }
    }
    for (var di = 0; di < 5; di++) {
        var dx = 100 + di * 50;
        fill(45, 40, 38); rect(dx - 18, 314, 36, 46, 6);
        fill(30, 26, 24); rect(dx - 13, 322, 26, 30, 4);
        fill(230, 220, 190); textSize(22); textAlign(CENTER); text(srDoor.dial[di], dx, 345);
        fill(150, 140, 120); triangle(dx - 5, 319, dx + 5, 319, dx, 315);
    }
    if (!srDoor.dark && !srDoor.open) {
        if (dist(srLight.x, srLight.y, X, Y + 4) < 16) {
            srDoor.hold++;
            if (srDoor.hold > 45) {
                srDoor.dark = 1;
                srDoor.seen = 1;
                srSay("*shloop*  (the keyhole drank your light)", 200, 386);
            }
        } else { srDoor.hold = min(srDoor.hold, 0); }
    }
    srDust();
    if (srDoor.dark) {
        srDoor.dark++;
        fill(0, 0, 0, 252); rect(0, 0, 400, 400);
        var ga = min(255, (srDoor.dark - 20) * 6);
        if (srDoor.dark > 400) { ga = max(0, (430 - srDoor.dark) * 8); }
        if (ga > 0) {
            for (var q2 = 0; q2 < 5; q2++) {
                srDrawPinDigit(srDoor.code[q2], SR_PIN_X[q2], SR_PIN_Y, ga, 3.2);
            }
            fill(255, 230, 160, ga * 0.4); ellipse(X, Y + 4, 10, 12);
        }
        if (srDoor.dark > 430) {
            srDoor.dark = 0; srDoor.hold = -90;
            burst(X, Y + 4, 150, 215, 255, 16, 2.5, 0.05);
            srLight = {x: X, y: Y + 4};
            srSay("*plip*  (your light pops back out)", 200, 386);
        }
    } else if (!srDoor.open) {
        srDarkness(srLight.x, srLight.y, 76, 240);
    }
};
var srRoom4Pressed = function() {
    if (srDoor.open) { return; }
    if (srDoor.dark) { srSay("it's too dark to do anything.", 200, 386); return; }
    for (var di = 0; di < 5; di++) {
        var dx = 100 + di * 50;
        if (abs(mouseX - dx) < 19 && mouseY > 312 && mouseY < 362) {
            srDoor.dial[di] = (srDoor.dial[di] + 1) % 10;
            return;
        }
    }
    if (dist(mouseX, mouseY, SR_DOOR_X, SR_DOOR_Y + 72) < 18) {
        var ok = true;
        for (var k = 0; k < 5; k++) { if (srDoor.dial[k] !== srDoor.code[k]) { ok = false; } }
        if (ok) {
            srDoor.open = 1;
            shake(6); flash(255, 245, 210, 140);
            srSay("*CREEEAAAK*", 200, 386);
        } else {
            shake(6);
            var nc = []; var no = [0, 1, 2, 3, 4];
            for (var d = 0; d < 5; d++) { nc.push(floor(random(0, 10))); }
            srDoor.code = nc; srDoor.order = no;
            burst(SR_DOOR_X, SR_PIN_Y + 14, 255, 230, 160, 20, 2.5, 0);
            srSay("WRONG PASSWORD.|*click click click* the pinholes moved. it's a NEW code now!", 200, 386);
        }
    }
};

// ============ ROOM 11: behind the door... THE RAIN KEY ============
var drawSrRoom5 = function() {
    background(255, 248, 225);
    noStroke();
    srDecorKeyRoom();
    for (var i = 0; i < 12; i++) {
        fill(170, 215, 255, 26);
        var rr = 60 + i * 34 + sin(frameCount * 2 + i * 20) * 8;
        ellipse(200, 170, rr, rr);
    }
    for (var d = 0; d < 16; d++) {
        fill(140, 200, 255, 120);
        var ddx = (d * 61) % 400; var ddy = (d * 97 + frameCount * 2) % 400;
        ellipse(ddx, ddy, 3, 6);
    }
    fill(140, 200, 255, 40 + sin(frameCount * 4) * 20); ellipse(200, 170, 130, 130);
    drawRainKey(200, 170 + sin(frameCount * 3) * 6, 3.2);
    fill(50, 90, 140); textSize(26); textAlign(CENTER);
    text("THE RAIN KEY", 200, 290);
    fill(90, 120, 160); textSize(12);
    text("it's for a door. a door that isn't here.", 200, 316);
};
var srTakeRainKey = function() {
    srHasRainKey = 1;
    srDrop.state = 3;
    level = 1;
    flash(140, 200, 255, 160);
    wolfMessage = "you got the RAIN KEY! (it's for a door. somewhere.)";
    wolfMessageTimer = 220;
};

// ============ THE SECRET ROUTE: draw + mouse ============
// ---- clicks for the 3 newer underground rooms ----
var srIcePressed = function() {
    var I = srIce;
    if (srExit) { if (dist(mouseX, mouseY, SR_IX + (I.goal % 9) * SR_IS + SR_IS / 2, SR_IY + floor(I.goal / 9) * SR_IS + SR_IS / 2) < 24) { srEnterRoom(13); } return; }
    if (mouseX > 150 && mouseX < 250 && mouseY < 22) { I.at = I.start; I.moves = 0; I.anim = 0; return; }
    if (I.anim > 0) { return; }
    var px = SR_IX + (I.at % 9) * SR_IS + SR_IS / 2; var py = SR_IY + floor(I.at / 9) * SR_IS + SR_IS / 2;
    var dx = mouseX - px; var dy = mouseY - py;
    if (abs(dx) < 10 && abs(dy) < 10) { return; }
    var dr = 0; var dc = 0;
    if (abs(dx) > abs(dy)) { dc = dx > 0 ? 1 : -1; } else { dr = dy > 0 ? 1 : -1; }
    var to = srIceSlide(I.at, dr, dc);
    if (to === I.at) { srSay("*bonk* you're already against a rock.", 200, 386); return; }
    I.from = I.at; I.at = to; I.moves++; I.anim = 12;
};
var srMazePressed = function() {
    var M = srMaze;
    if (srExit) { if (dist(mouseX, mouseY, SR_MX + 6.5 * SR_MS, SR_MY + 6.5 * SR_MS) < 26) { srEnterRoom(14); } return; }
    var c = floor((mouseX - SR_MX) / SR_MS); var r = floor((mouseY - SR_MY) / SR_MS);
    if (c < 0 || r < 0 || c > 6 || r > 6) { return; }
    var to = r * 7 + c;
    var ar = floor(M.at / 7); var ac = M.at % 7;
    if (abs(ar - r) + abs(ac - c) !== 1) { srSay("you can only move to a square right NEXT to you.", 200, 386); return; }
    if (srMazeOpen(M.at, to)) {
        M.at = to; M.trail[to] = 1;
        if (to === 48) { srExit = 1; flash(255, 240, 200, 80); srSay("you found the way out! (click it)", 200, 386); }
    } else {
        // BONK. the wall lights up, and you're back at the start
        if (to === M.at + 1) { M.seenR[M.at] = 1; } else if (to === M.at - 1) { M.seenR[to] = 1; } else if (to === M.at + 7) { M.seenD[M.at] = 1; } else { M.seenD[to] = 1; }
        M.bonks++; M.at = 0; shake(5);
        for (var k = 0; k < 49; k++) { M.trail[k] = 0; } M.trail[0] = 1;
        srSay("*BONK* a wall! ...you wake up back at the start.", 200, 386);
    }
};
var srClockPressed = function() {
    var K = srClock;
    if (srExit) { if (dist(mouseX, mouseY, 200, 218) < 30) { srEnterRoom(10); } return; }
    if (mouseX > 150 && mouseX < 250 && mouseY > 370 && mouseY < 392) { for (var z = 0; z < SR_CN; z++) { K.used[z] = 0; } K.cur = -1; K.n = 0; return; }
    for (var i = 0; i < SR_CN; i++) {
        var p = srClockPos(i);
        if (dist(mouseX, mouseY, p[0], p[1]) > 20) { continue; }
        if (K.cur < 0) { K.cur = i; K.used[i] = 1; K.n = 1; return; }
        var ok = !K.used[i] && (i === (K.cur + K.vals[K.cur]) % SR_CN || i === (K.cur - K.vals[K.cur] + SR_CN * 4) % SR_CN);
        if (!ok) { srSay(K.used[i] ? "that seed is already lit." : "you have to hop EXACTLY " + K.vals[K.cur] + " spots from where you are.", 200, 386); return; }
        K.cur = i; K.used[i] = 1; K.n++;
        burst(p[0], p[1], 255, 220, 90, 8, 2, 0);
        if (K.n === SR_CN) { srExit = 1; flash(255, 230, 140, 90); srSay("every seed is glowing! the middle of the clock opens up.", 200, 386); return; }
        var a = (K.cur + K.vals[K.cur]) % SR_CN; var b = (K.cur - K.vals[K.cur] + SR_CN * 4) % SR_CN;
        if (K.used[a] && K.used[b]) { shake(4); srSay("stuck! no seeds left to hop to. (click START OVER)", 200, 386); }
        return;
    }
};
// the order the rooms come in (12, 13, 14 come after the snail, before the door)
var SR_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 10, 11];
var srShowNum = function(r) { return SR_ORDER.indexOf(r) + 1; };
var drawSecretRoute = function() {
    if (!srReady) { srInit(); } else if (srBuilt !== srRoom) { srEnterRoom(srRoom); }
    srLight.x += (mouseX - srLight.x) * 0.18;
    srLight.y += (mouseY - srLight.y) * 0.18;
    if (srRoom === 0) { drawSrRoom0(); }
    else if (srRoom === 1) { drawSrRoom1(); }
    else if (srRoom === 2) { drawSrRoom2(); }
    else if (srRoom === 3) { drawSrRoom3(); }
    else if (srRoom === 4) { drawSrRoom4Cross(); }
    else if (srRoom === 5) { drawSrRoom5Beetles(); }
    else if (srRoom === 6) { drawSrRoom6Garden(); }
    else if (srRoom === 7) { drawSrRoom7Jugs(); }
    else if (srRoom === 8) { drawSrRoom8Acorns(); }
    else if (srRoom === 9) { drawSrRoom9Snail(); }
    else if (srRoom === 10) { drawSrRoom4(); }
    else if (srRoom === 12) { drawSrIce(); }
    else if (srRoom === 13) { drawSrMaze(); }
    else if (srRoom === 14) { drawSrClock(); }
    else { drawSrRoom5(); }
    if (srRoom < 11 && !(srRoom === 10 && (srDoor.dark || srDoor.open))) { srDrawDropAt(srLight.x, srLight.y, 1); }
    if (srRoom === 14) { srDrawDropAt(srLight.x, srLight.y, 0.7); }
    if (srTitleT > 0 && srRoom !== 11) {
        srTitleT--;
        var ta = min(255, srTitleT * 4);
        textSize(10); textAlign(CENTER);
        fill(180, 220, 255, ta); text("SECRET ROUTE   S-" + srShowNum(srRoom), 200, 26);
        textSize(20);
        fill(255, 240, 200, ta); text(SR_NAMES[srRoom], 200, 48);
    }
    srDrawMsg();
};
var srMousePressed = function() {
    if (!srReady) { srInit(); }
    if (srRoom === 0) { srRoom0Pressed(); }
    else if (srRoom === 1) { srRoom1Pressed(); }
    else if (srRoom === 2) { srRoom2Pressed(); }
    else if (srRoom === 3) { srRoom3Pressed(); }
    else if (srRoom === 4) { srRoom4CrossPressed(); }
    else if (srRoom === 5) { srRoom5BeetlesPressed(); }
    else if (srRoom === 6) { srRoom6GardenPressed(); }
    else if (srRoom === 7) { srRoom7JugsPressed(); }
    else if (srRoom === 8) { srRoom8AcornsPressed(); }
    else if (srRoom === 9) { srRoom9SnailPressed(); }
    else if (srRoom === 10) { srRoom4Pressed(); }
    else if (srRoom === 12) { srIcePressed(); }
    else if (srRoom === 13) { srMazePressed(); }
    else if (srRoom === 14) { srClockPressed(); }
    else if (dist(mouseX, mouseY, 200, 180) < 60) { srTakeRainKey(); }
};
var srMouseReleased = function() {
    if (srRoom === 0) { srRoom0Released(); }
};
var srStuckKey = function() {
    var pipes = "";
    for (var i = 0; i < srPipes.length; i++) { pipes += srPipes[i].m; }
    return srDrop.state + srPocket.clicks + srCup.water + srSteam.on + "," + srRoom + srExit + srW.uses + srW.active + srHeld + srMole.happy + "," +
        srWorms.join("") + srBat.input.length + srBat.done + srBat.said + pipes + srPipeDone + srCross.side.join("") + srCross.raft + srCross.load + srBeetles.walk + srSud.cell.join("") + srJug.a + srJug.b + srHanoi.peg[0].length + srHanoi.peg[1].length + srHanoi.held + srMind.guesses.length + srMind.cur.join("") + srDoor.seen + srDoor.dark + srDoor.dial.join("");
};
var srHints = function() {
    var t = [];
    if (srRoom === 0) {
        if (srExit) { t.push([SR_MOLE_X, SR_MOLE_Y + 10]); return t; }
        if (srMole.talk === 0) { t.push([SR_MOLE_X, SR_MOLE_Y - 20]); return t; }
        if (srPanCount(1) === 0) { t.push([34, 354, SR_SCALE_X - 85, SR_SCALE_Y + 66]); return t; }
        t.push([SR_SCALE_X, SR_SCALE_Y]);
    } else if (srRoom === 1) {
        if (srExit) { t.push([200, 356]); } else { t.push([40, 326]); }
    } else if (srRoom === 2) {
        if (srExit) { t.push([45, 300]); } else if (!srBat.said) { t.push([srBatX, 40]); }
    } else if (srRoom === 3) {
        if (srExit) { t.push([368, 36]); } else { t.push([SR_PX0 - 26, SR_PY0 + SR_PS / 2]); }
    } else if (srRoom === 4) {
        if (srExit) { t.push([360, 150]); } else { t.push([srCrossRaftX() + 16, 236]); }
    } else if (srRoom === 5) {
        t.push([110 + 90, 80]);
    } else if (srRoom === 6) {
        if (srExit) { t.push([200, 360]); } else { t.push([200, 50]); }
    } else if (srRoom === 7) {
        if (srExit) { t.push([200, 150]); } else { t.push([200, 46]); }
    } else if (srRoom === 8) {
        if (srExit) { t.push([200, 150]); } else { t.push([90, 250, 310, 250]); }
    } else if (srRoom === 9) {
        if (srExit) { t.push([260, 200]); } else { t.push([248, 352]); }
    } else if (srRoom === 10) {
        if (srDoor.dark || srDoor.open) { return t; }
        if (!srDoor.seen) { t.push([SR_DOOR_X, SR_DOOR_Y + 4]); } else { t.push([SR_DOOR_X, SR_DOOR_Y + 72]); }
    } else if (srRoom === 11) { t.push([200, 170]); }
    return t;
};

// ============ THE R.A.I.N. ENDING (storm fish on stage -> pull the curtain -> uh oh) ============
var RAIN_LEVEL = 98;
var RN_XS = [28, 74, 122, 166, 206, 248, 300, 360];
var RN_NAMES = ["the werewolf", "the purple monster", "the fox", "the bird", "the eyeball", "the duck", "the vending machine", "Rex", "the Altar Beast"];
var RN_TEXT = ["congrats!!!!!!", "you found the secret R.A.I.N. ending.", "what does rain stand for?",
               "Ridiculous.", "Atrocious.", "Incredible.", "Nuisance.", "well, congrats!"];
// the 4 R.A.I.N. words can be clicked to change them. the sticky notes say what they SHOULD be.
var RN_WORDS = [["Ridiculous.", "Rotten.", "Radiant.", "Really."], ["Atrocious.", "Awful.", "Amazing.", "Absolutely."],
                ["Incredible.", "Icky.", "Irritating.", "Important."], ["Nuisance.", "Nasty.", "Nice.", "Noble."]];
var RN_GOAL = [2, 2, 0, 2];
var RN_NOTES = ["NADIRTA", "ZAGIMAN", "BLEDIRCINE", "CENI"];
var rainEnd = {on: 0};
var rnInit = function() {
    rainEnd = {on: 1, phase: 0, t: 0, hp: 1000, bub: [], shots: [], soak: 0, next: 70, shotT: 0,
          fx: l9Rain.fishX, fy: l9Rain.fishY, fs: 0.42, face: 1, water: 0, cracks: [], full: -1,
          php: 5, hurt: 0, lost: 0, atk: -1, atkT: 0, lastAtk: "", words: [0, 0, 0, 0], puzzle: 0, bolts: [], rings: [],
          hits: 0, hz: [], hitCD: 0, flashHit: 0, dmg: []};
    rainEnd.pos = []; rainEnd.wait = 0; rainEnd.merged = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 9; i++) {
        rainEnd.bub.push({state: 0, timer: 0, fall: 0, x: 0, y: 0});
        rainEnd.pos.push({x: 0, y: 0, s: 1, d0: -1, stuck: 0});
    }
    // cracks for when the screen breaks (from the middle outwards)
    for (var c = 0; c < 11; c++) {
        var a = c * 33 + 10; var pts = [[200, 200]];
        var px = 200; var py = 200;
        for (var s = 0; s < 6; s++) {
            a += sin(c * 70 + s * 50) * 25;
            px += cos(a) * 45; py += sin(a) * 45;
            pts.push([px, py]);
        }
        rainEnd.cracks.push(pts);
    }
};
var rnHome = function(i) {
    if (i === 8) { return [200, 232]; }
    return [RN_XS[i], 296];
};
var rnDrawCast = function(i, x, y, s) {
    pushMatrix(); translate(x, y); scale(s);
    if (i === 0) { l9DrawWerewolf(0, -78, 0.4, false); }
    else if (i === 1) { l9DrawMonster(0, -26, 1.3); }
    else if (i === 2) { l9DrawFox(-4, -18); }
    else if (i === 3) { l9DrawBird(0, -30); }
    else if (i === 4) { l9DrawEyeball(0, -26); }
    else if (i === 5) { l9DrawDuck(-4, -12, 1); }
    else if (i === 6) { l9DrawVending(0, 0, 0.2); }
    else if (i === 7) { l9DrawRex(-6, -18, "awake", 1); }
    else { drawAltarBeast(0, -64, 0.62, 200, 150, false); }
    popMatrix();
};
var rnStage = function() {
    noStroke();
    background(20, 12, 16);
    fill(40, 22, 28); rect(0, 0, 400, 300);
    fill(100, 60, 35); rect(0, 300, 400, 100);
    fill(255, 240, 200, 26); ellipse(200, 300, 420, 90);
    fill(255, 250, 220, 12); triangle(200, -20, 20, 320, 380, 320);
    fill(150, 20, 30); rect(0, 0, 30, 300); rect(370, 0, 30, 300);
    fill(110, 10, 20); rect(0, 0, 400, 18);
};
var rnCurtains = function(cl) {
    noStroke();
    fill(150, 20, 30);
    rect(0, 0, 200 * cl, 400); rect(400 - 200 * cl, 0, 200 * cl, 400);
    fill(120, 10, 20);
    for (var f = 0; f < 5; f++) {
        rect(200 * cl - 40 + f * 8, 0, 3, 400 * min(1, cl * 2));
        rect(400 - 200 * cl + 10 + f * 8, 0, 3, 400 * min(1, cl * 2));
    }
    fill(110, 10, 20); rect(0, 0, 400, 24);
};
var rnSlot = function(i) {
    var a = -15 + i * (210 / 8);
    var f = rainEnd.fs;
    return [rainEnd.fx + cos(a) * 70 * f, rainEnd.fy + 14 * f + sin(a) * 48 * f];
};
var rnWater = function(level, r, g, b, a) {
    var top = 400 - level;
    noStroke(); fill(r, g, b, a);
    beginShape();
    vertex(0, 400);
    for (var x = 0; x <= 400; x += 20) { vertex(x, top + sin(frameCount * 4 + x * 3) * 4); }
    vertex(400, 400);
    endShape(CLOSE);
    fill(200, 230, 255, a * 0.5);
    for (var x2 = 0; x2 < 400; x2 += 20) { rect(x2, top + sin(frameCount * 4 + x2 * 3) * 4 - 1, 12, 2); }
};
var rnRain = function(n, a) {
    stroke(150, 190, 255, a); strokeWeight(1.5);
    for (var i = 0; i < n; i++) {
        var x = (i * 53 + frameCount * 3) % 420 - 10;
        var y = (i * 89 + frameCount * 14) % 420 - 20;
        line(x, y, x - 4, y + 16);
    }
    noStroke(); strokeWeight(1);
};

// where each friend ended up ON the storm fish (fish coords, facing right)
var RN_PART = [[34, -24], [-32, -24], [-76, -24], [4, 26], [-4, -12], [47, 5], [-18, 4], [14, 14], [-22, 36]];
var rnPartPos = function(i) {
    return [rainEnd.fx + rainEnd.face * rainEnd.fs * RN_PART[i][0], rainEnd.fy + rainEnd.fs * RN_PART[i][1]];
};
// the storm fish with everyone merged INTO him. on[i] = that friend is still part of him
var drawMergedStormFish = function(x, y, s, d, on) {
    pushMatrix(); translate(x, y); scale(s * d, s);
    noStroke();
    var w = sin(frameCount * 8);
    // 8: the Altar Beast's bone tentacles hanging from his belly
    if (on[8]) {
        fill(120, 40, 200, 60); ellipse(-20, 30, 50, 30);
        for (var tn = 0; tn < 3; tn++) {
            for (var sg = 0; sg < 6; sg++) {
                var tx = -32 + tn * 12 + sin(frameCount * 5 + sg * 40 + tn * 90) * sg * 1.2;
                fill(225, 210, 180); ellipse(tx, 18 + sg * 5, 7 - sg * 0.6, 6);
                fill(150, 60, 200); ellipse(tx, 18 + sg * 5, 2, 2);
            }
        }
    }
    // 2: the fox's big bushy tail on top of his tail
    if (on[2]) {
        fill(225, 115, 40);
        beginShape(); vertex(-46, -4); vertex(-66, -30); vertex(-90, -40 + w * 3); vertex(-86, -24); vertex(-62, -2); endShape(CLOSE);
        fill(245, 245, 240); triangle(-90, -40 + w * 3, -78, -36 + w * 2, -86, -26);
        fill(190, 90, 30); triangle(-58, -10, -70, -26, -66, -12);
    }
    popMatrix();
    drawStormFish(x, y, s, d);
    pushMatrix(); translate(x, y); scale(s * d, s);
    noStroke();
    // 0: werewolf ears + fur on his head
    if (on[0]) {
        fill(77, 49, 0);
        triangle(24, -14, 29, -36, 35, -15); triangle(33, -15, 41, -34, 43, -11);
        fill(140, 60, 40); triangle(27, -16, 29.5, -29, 32, -16);
        fill(77, 49, 0);
        for (var fu = 0; fu < 4; fu++) { triangle(16 + fu * 5, -16, 19 + fu * 5, -23, 22 + fu * 5, -16); }
        fill(255, 40, 20, 90); ellipse(33, -7, 18, 18);
    }
    // 1: purple monster horns + purple spots
    if (on[1]) {
        fill(150, 20, 200);
        triangle(-38, -14, -44, -36, -31, -16); triangle(-28, -16, -27, -38, -20, -17);
        fill(190, 80, 240); triangle(-37, -17, -41, -30, -34, -18);
        fill(170, 40, 220, 170); ellipse(-34, 2, 10, 7); ellipse(-26, -6, 7, 5); ellipse(-38, -6, 6, 5);
    }
    // 3: the bird's wing as a fin
    if (on[3]) {
        fill(180, 120, 60);
        beginShape(); vertex(-4, 12); vertex(-14, 30 + w * 3); vertex(2, 36 + w * 3); vertex(16, 30 + w * 2); vertex(14, 14); endShape(CLOSE);
        stroke(130, 80, 35); strokeWeight(1.2);
        line(-2, 16, -8, 30 + w * 3); line(4, 16, 2, 34 + w * 3); line(10, 16, 12, 31 + w * 2);
        noStroke();
    }
    // 4: an extra eyeball on his back
    if (on[4]) {
        fill(240, 220, 200); ellipse(-4, -12, 15, 13);
        fill(80, 200, 80); ellipse(-3, -12, 9, 9);
        fill(0); ellipse(-2.5, -12, 4, 4);
        fill(255, 255, 255, 200); ellipse(-1, -14, 2, 2);
        stroke(200, 80, 80, 150); strokeWeight(0.7); line(-11, -13, -8, -12); line(4, -10, 1, -11); noStroke();
    }
    // 5: a duck bill on his mouth
    if (on[5]) {
        fill(255, 150, 20); ellipse(48, 3, 22, 9);
        fill(235, 120, 10); ellipse(47, 8, 18, 6);
        fill(200, 100, 10); ellipse(53, 2, 2, 1.5);
    }
    // 6: the vending machine stuck in his side
    if (on[6]) {
        fill(185, 32, 44); rect(-28, -5, 22, 18, 2);
        fill(28, 30, 40); rect(-26, -3, 13, 14, 1);
        var vc = [[230, 60, 50], [250, 190, 40], [60, 140, 230], [120, 200, 80]];
        for (var vr = 0; vr < 2; vr++) {
            for (var vk = 0; vk < 2; vk++) { var c = vc[vr * 2 + vk]; fill(c[0], c[1], c[2]); rect(-25 + vk * 5.5, -2 + vr * 6.5, 4, 5); }
        }
        fill(200); rect(-12, -2, 4, 2); rect(-12, 2, 4, 2); rect(-12, 6, 4, 2);
    }
    // 7: Rex's collar + tag
    if (on[7]) {
        fill(200, 40, 40); rect(11, -18, 6, 36, 2);
        fill(240, 200, 60); ellipse(14, 20, 7, 7);
        fill(180, 140, 30); ellipse(14, 20, 3, 3);
    }
    popMatrix();
};
// you got hit!
var rnHurt = function() {
    if (rainEnd.hurt > 0 || rainEnd.lost) { return; }
    rainEnd.php--;
    rainEnd.hurt = 55;
    shake(8); flash(255, 0, 40, 90);
    burst(mouseX, mouseY, 120, 190, 255, 16, 3, 0.1);
    if (rainEnd.php <= 0) {
        rainEnd.lost = 1;
        rainEnd.hz = [];
    } else {
        var ow = ["OUCH!", "SPLASH! (-1 heart)", "ZAP!! (-1 heart)", "glub glub (-1 heart)"];
        l9Say(ow[floor(random(0, ow.length))], 200, 360);
    }
};
// ---- the storm fish's attacks (his own + one for every friend merged into him) ----
var RN_ATK_NAMES = ["WEREWOLF CLAWS!", "MONSTER CHOMP!", "FOX DASH!", "BIRD DIVE-BOMB!", "EYEBALL LASER!",
                    "DUCK SQUEAK!", "SNACK ATTACK!", "BONE-ERANG!", "TENTACLE SLAM!"];
var rnAttack = function(pick) {
    var mx = constrain(mouseX, 20, 380); var my = constrain(mouseY, 60, 380);
    var k;
    if (pick === "water") {
        for (k = 0; k < 4; k++) {
            rainEnd.hz.push({k: "ball", style: "water", sx: rainEnd.fx + rainEnd.face * 90, sy: rainEnd.fy + 10,
                tx: constrain(mx + (k - 1.5) * 34, 16, 384), ty: constrain(my + random(-10, 10), 60, 384), t: -k * 6, dur: 45, r: 22});
        }
    } else if (pick === "hail") {
        l9Say("HAILSTORM!", 200, 66);
        for (k = 0; k < 12; k++) {
            var hx = k < 3 ? constrain(mx + random(-40, 40), 14, 386) : random(14, 386);
            var hy = k < 3 ? my : random(120, 380);
            rainEnd.hz.push({k: "hail", x: hx, y: -20, ty: hy, t: -k * 4, warn: 34, c: [200, 230, 255]});
        }
    } else if (pick === "wave") {
        l9Say("TIDAL WAVE!", 200, 66);
        rainEnd.hz.push({k: "wave", dir: random(0, 1) < 0.5 ? 1 : -1, top: 150, t: 0, warn: 50, dur: 70});
    } else if (pick === "cage") {
        l9Say("THUNDER CAGE!", 200, 66);
        rainEnd.hz.push({k: "cage", x: mx, y: my, t: 0, warn: 42, dur: 22, r: 60});
    } else if (pick === "pool") {
        l9Say("WHIRLPOOL!", 200, 66);
        rainEnd.hz.push({k: "pool", x: mx, y: my, t: 0, warn: 40, dur: 90, r: 58});
    } else if (pick === "lightning") {
        rainEnd.hz.push({k: "col", style: "bolt", x: mx, t: 0, warn: 48, dur: 14, w: 40});
        rainEnd.hz.push({k: "col", style: "bolt", x: random(30, 370), t: -10, warn: 48, dur: 14, w: 40});
    } else {
        var f = parseInt(pick.substring(1), 10);
        l9Say("he uses " + RN_ATK_NAMES[f], 200, 66);
        if (f === 0) {
            for (k = 0; k < 3; k++) {
                rainEnd.hz.push({k: "slash", x: constrain(mx + random(-30, 30), 30, 370), y: constrain(my + random(-30, 30), 70, 370), t: -k * 12, warn: 34, dur: 10, r: 30});
            }
        } else if (f === 1) {
            rainEnd.hz.push({k: "chomp", x: mx, y: my, t: 0, warn: 50, dur: 16, r: 44});
        } else if (f === 2) {
            rainEnd.hz.push({k: "fox", y: constrain(my, 70, 350), t: 0, warn: 45, dur: 42});
        } else if (f === 3) {
            for (k = 0; k < 3; k++) {
                rainEnd.hz.push({k: "ball", style: "bird", sx: random(20, 380), sy: -20,
                    tx: constrain(mx + (k - 1) * 40, 16, 384), ty: my, t: -k * 10, dur: 50, r: 20});
            }
        } else if (f === 4) {
            rainEnd.hz.push({k: "laser", x: rainEnd.fx, y: rainEnd.fy, tx: mx, ty: my, t: 0, warn: 45, dur: 18});
        } else if (f === 5) {
            rainEnd.hz.push({k: "ring", x: rainEnd.fx, y: rainEnd.fy, r: 20, gap: random(0, 360), t: 0});
        } else if (f === 6) {
            for (k = 0; k < 6; k++) {
                rainEnd.hz.push({k: "drop", x: constrain(mx + random(-110, 110), 14, 386), y: -20, t: -k * 7, warn: 30,
                    c: [[230, 60, 50], [250, 190, 40], [60, 140, 230], [120, 200, 80]][k % 4]});
            }
        } else if (f === 7) {
            rainEnd.hz.push({k: "boom", sx: rainEnd.fx, sy: rainEnd.fy + 20, tx: mx, ty: my, t: 0, dur: 84});
        } else {
            rainEnd.hz.push({k: "col", style: "tentacle", x: mx, t: 0, warn: 45, dur: 26, w: 34});
            rainEnd.hz.push({k: "col", style: "tentacle", x: random(30, 370), t: -8, warn: 45, dur: 26, w: 34});
            rainEnd.hz.push({k: "col", style: "tentacle", x: random(30, 370), t: -16, warn: 45, dur: 26, w: 34});
        }
    }
};
var rnBone = function(x, y, ang) {
    var dx = cos(ang) * 11; var dy = sin(ang) * 11;
    stroke(235, 225, 200); strokeWeight(5); line(x - dx, y - dy, x + dx, y + dy); noStroke();
    fill(240, 232, 210);
    ellipse(x - dx + sin(ang) * 3, y - dy - cos(ang) * 3, 7, 7); ellipse(x - dx - sin(ang) * 3, y - dy + cos(ang) * 3, 7, 7);
    ellipse(x + dx + sin(ang) * 3, y + dy - cos(ang) * 3, 7, 7); ellipse(x + dx - sin(ang) * 3, y + dy + cos(ang) * 3, 7, 7);
};
// draws one hazard, hurts you if it touches you. returns true when it's finished
var rnHazard = function(H) {
    H.t++;
    if (H.t < 0) { return false; }
    var a, k, d;
    if (H.k === "ball") {
        k = H.t / H.dur;
        noFill(); stroke(H.style === "bird" ? 255 : 150, H.style === "bird" ? 200 : 210, H.style === "bird" ? 120 : 255, 170); strokeWeight(2);
        ellipse(H.tx, H.ty, 44 - k * 24, 44 - k * 24);
        noStroke();
        var bx = H.sx + (H.tx - H.sx) * k; var by = H.sy + (H.ty - H.sy) * k;
        if (H.style === "water") {
            by -= sin(k * 180) * 50;
            fill(80, 160, 255, 110); ellipse(bx, by, 24, 24);
            fill(170, 225, 255); ellipse(bx, by, 14, 14);
            fill(255, 255, 255, 200); ellipse(bx - 3, by - 3, 4, 4);
        } else {
            drawSongbird(bx, by, 1.1, 180, 120, 60, frameCount * 30, false);
        }
        if (H.t >= H.dur) {
            burst(H.tx, H.ty, 120, 190, 255, 10, 2.5, 0.1);
            if (dist(mouseX, mouseY, H.tx, H.ty) < H.r) { rnHurt(); }
            return true;
        }
        return false;
    }
    if (H.k === "col") {
        var tent = H.style === "tentacle";
        if (H.t < H.warn) {
            a = (H.t % 10 < 5) ? 90 : 40;
            if (tent) { fill(170, 70, 230, a); } else { fill(255, 240, 90, a); }
            rect(H.x - H.w / 2, tent ? 130 : 0, H.w, tent ? 270 : 400);
            return false;
        }
        if (H.t < H.warn + H.dur) {
            if (tent) {
                var up = min(1, (H.t - H.warn) / 8);
                for (var sg = 0; sg < 12; sg++) {
                    var sy = 360 - sg * 20 * up;
                    var sx = H.x + sin(frameCount * 10 + sg * 40) * 4;
                    fill(225, 210, 180); ellipse(sx, sy, 22 - sg, 18);
                    fill(150, 60, 200); ellipse(sx, sy, 6, 6);
                }
                if (H.t === H.warn) { shake(5); burst(H.x, 350, 170, 90, 230, 14, 3, 0.1); }
                if (abs(mouseX - H.x) < H.w / 2 && mouseY > 360 - 230 * up) { rnHurt(); }
            } else {
                if (H.t === H.warn) { shake(5); flash(255, 255, 230, 70); burst(H.x, 330, 255, 250, 180, 14, 3.5, 0.1); }
                drawLightningBolt(H.x, 0, H.x, 340, H.t + H.x, 255);
                if (abs(mouseX - H.x) < H.w / 2) { rnHurt(); }
            }
            return false;
        }
        return true;
    }
    if (H.k === "slash") {
        if (H.t < H.warn) {
            noFill(); stroke(255, 60, 60, (H.t % 10 < 5) ? 200 : 90); strokeWeight(2);
            ellipse(H.x, H.y, H.r * 2, H.r * 2); noStroke();
            return false;
        }
        if (H.t < H.warn + H.dur) {
            var sl = (H.t - H.warn) / H.dur;
            stroke(255, 70, 50, 255 * (1 - sl * 0.6)); strokeWeight(5);
            for (var cl = -1; cl <= 1; cl++) { line(H.x - 26 + cl * 11, H.y - 26, H.x + 22 + cl * 11, H.y + 26); }
            noStroke();
            if (H.t === H.warn) { shake(4); burst(H.x, H.y, 255, 80, 60, 10, 3, 0); }
            if (dist(mouseX, mouseY, H.x, H.y) < H.r) { rnHurt(); }
            return false;
        }
        return true;
    }
    if (H.k === "chomp") {
        // a GIANT purple monster face: red eyes, then the mouth snaps shut with its two fangs
        var fa = H.t < H.warn ? min(1, H.t / 18) : 1;
        var open = H.t < H.warn ? 1 : max(0, 1 - (H.t - H.warn) / 5);
        var R = H.r;
        noStroke();
        fill(150, 20, 200, 50 * fa); ellipse(H.x, H.y, R * 3, R * 3);
        fill(150, 20, 200, 230 * fa); ellipse(H.x, H.y - R * 0.35, R * 2.5, R * 2.3);
        fill(93, 12, 144, 230 * fa); ellipse(H.x, H.y + R * 0.15, R * 2.2, R * 1.2);
        // the eyes (red, yellow, slit pupils)
        for (var ei = -1; ei <= 1; ei += 2) {
            var exx = H.x + ei * R * 0.42; var eyy = H.y - R * 0.95;
            fill(255, 50, 50, 255 * fa); ellipse(exx, eyy, R * 0.55, R * 0.55);
            fill(255, 200, 0, 255 * fa); ellipse(exx, eyy, R * 0.32, R * 0.32);
            fill(0, 255 * fa); ellipse(exx, eyy, R * 0.09, R * 0.3);
            fill(255, 255 * fa); ellipse(exx - R * 0.07, eyy - R * 0.1, R * 0.1, R * 0.1);
        }
        // the mouth: wide open while it warns you, then CHOMP
        var mh = R * 1.3 * open;
        fill(40, 5, 55, 255 * fa); ellipse(H.x, H.y, R * 1.9, max(2, mh));
        if (open > 0.2) { fill(200, 60, 90, 200 * fa); ellipse(H.x, H.y + mh * 0.25, R * 1.1, mh * 0.4); }
        stroke(56, 5, 100, 255 * fa); strokeWeight(3);
        line(H.x - R * 0.95, H.y - mh / 2, H.x + R * 0.95, H.y - mh / 2);
        noStroke();
        // the two fangs (just like the little monster's)
        fill(255, 255 * fa);
        triangle(H.x - R * 0.42, H.y - mh / 2, H.x - R * 0.28, H.y - mh / 2 + R * 0.5, H.x - R * 0.14, H.y - mh / 2);
        triangle(H.x + R * 0.14, H.y - mh / 2, H.x + R * 0.28, H.y - mh / 2 + R * 0.42, H.x + R * 0.42, H.y - mh / 2);
        if (H.t < H.warn && H.t % 12 < 6) { fill(255, 230, 90); textSize(14); textAlign(CENTER); text("!", H.x, H.y - R * 1.6); }
        if (H.t >= H.warn) {
            if (H.t === H.warn + 4) { shake(7); burst(H.x, H.y, 190, 80, 255, 14, 3, 0); }
            fill(255); textSize(16); textAlign(CENTER); text("CHOMP!", H.x, H.y - R * 1.6);
            if (H.t <= H.warn + 7 && dist(mouseX, mouseY, H.x, H.y) < R) { rnHurt(); }
            return H.t >= H.warn + H.dur;
        }
        return false;
    }
    if (H.k === "fox") {
        if (H.t < H.warn) {
            fill(255, 150, 40, (H.t % 10 < 5) ? 80 : 35); rect(0, H.y - 20, 400, 40);
            fill(255, 190, 90, 200); textSize(16); textAlign(CENTER); text(">  >  >", 200, H.y + 6);
            return false;
        }
        if (H.t < H.warn + H.dur) {
            var fxp = -50 + 500 * (H.t - H.warn) / H.dur;
            drawFoxDetailed(fxp, H.y - 4, true);
            fill(255, 200, 120, 80); rect(fxp - 80, H.y - 6, 50, 3); rect(fxp - 70, H.y + 6, 40, 3);
            if (abs(mouseY - H.y) < 22 && abs(mouseX - fxp) < 36) { rnHurt(); }
            return false;
        }
        return true;
    }
    if (H.k === "laser") {
        var ldx = H.tx - H.x; var ldy = H.ty - H.y;
        var ll = max(1, sqrt(ldx * ldx + ldy * ldy));
        ldx /= ll; ldy /= ll;
        var ex = H.x + ldx * 600; var ey = H.y + ldy * 600;
        if (H.t < H.warn) {
            stroke(80, 255, 80, (H.t % 8 < 4) ? 200 : 70); strokeWeight(1.5);
            line(H.x, H.y, ex, ey); noStroke();
            return false;
        }
        if (H.t < H.warn + H.dur) {
            stroke(80, 255, 80, 120); strokeWeight(16); line(H.x, H.y, ex, ey);
            stroke(230, 255, 230); strokeWeight(5); line(H.x, H.y, ex, ey);
            noStroke();
            if (H.t === H.warn) { shake(5); }
            var along = (mouseX - H.x) * ldx + (mouseY - H.y) * ldy;
            var across = abs((mouseX - H.x) * ldy - (mouseY - H.y) * ldx);
            if (along > 0 && across < 11) { rnHurt(); }
            return false;
        }
        return true;
    }
    if (H.k === "ring") {
        if (H.t < 50) {
            // warning: a rubber duck puffs up in front of him, and the gap is marked SAFE
            var sq = 1 + sin(H.t * 18) * 0.12;
            fill(255, 220, 60, 60); ellipse(H.x, H.y, 120 + H.t, 120 + H.t);
            l9DrawDuck(H.x - 6, H.y + 10, sq);
            noFill(); stroke(255, 220, 60, (H.t % 10 < 5) ? 200 : 80); strokeWeight(2);
            ellipse(H.x, H.y, 160, 160);
            noStroke();
            var gx = H.x + cos(H.gap) * 110; var gy = H.y + sin(H.gap) * 110;
            fill(80, 255, 120, 90); ellipse(gx, gy, 46, 46);
            fill(80, 255, 120); textSize(11); textAlign(CENTER); text("SAFE", gx, gy + 4);
            fill(255, 230, 90); textSize(12); text("squeak incoming...", H.x, H.y - 90);
            return false;
        }
        H.r += 3.2;
        for (var ang = 0; ang < 360; ang += 7) {
            var da = abs(((ang - H.gap) % 360 + 540) % 360 - 180);
            if (da < 30) { continue; }
            fill(255, 220, 60, 210); ellipse(H.x + cos(ang) * H.r, H.y + sin(ang) * H.r, 9, 9);
            fill(255, 250, 200); ellipse(H.x + cos(ang) * H.r, H.y + sin(ang) * H.r, 4, 4);
        }
        if (H.r < 120) { fill(255, 230, 90, 200); textSize(12); textAlign(CENTER); text("SQUEAK!", H.x, H.y - H.r - 6); }
        var md = dist(mouseX, mouseY, H.x, H.y);
        if (abs(md - H.r) < 8 && md > 0) {
            var dot = ((mouseX - H.x) * cos(H.gap) + (mouseY - H.y) * sin(H.gap)) / md;
            if (dot < 0.866) { rnHurt(); }
        }
        return H.r > 560;
    }
    if (H.k === "hail") {
        if (H.t < H.warn) {
            fill(0, 0, 0, 80); ellipse(H.x, H.ty + 6, 22, 7);
            noFill(); stroke(200, 230, 255, (H.t % 8 < 4) ? 200 : 80); strokeWeight(1.5); ellipse(H.x, H.ty, 30, 30); noStroke();
            return false;
        }
        H.y += 13;
        fill(220, 240, 255); ellipse(H.x, H.y, 12, 12);
        fill(255); ellipse(H.x - 2, H.y - 2, 4, 4);
        if (H.y >= H.ty) {
            burst(H.x, H.ty, 210, 235, 255, 8, 2.5, 0.12);
            if (dist(mouseX, mouseY, H.x, H.ty) < 18) { rnHurt(); }
            return true;
        }
        return false;
    }
    if (H.k === "wave") {
        if (H.t < H.warn) {
            fill(60, 140, 255, (H.t % 10 < 5) ? 70 : 30); rect(0, H.top, 400, 400 - H.top);
            fill(200, 230, 255); textSize(16); textAlign(CENTER);
            text(H.dir > 0 ? ">>>  GET UP HIGH!  >>>" : "<<<  GET UP HIGH!  <<<", 200, H.top + 40);
            return false;
        }
        if (H.t < H.warn + H.dur) {
            var wk = (H.t - H.warn) / H.dur;
            var front = H.dir > 0 ? -60 + 520 * wk : 460 - 520 * wk;
            fill(50, 120, 230, 200);
            if (H.dir > 0) { rect(0, H.top + 20, max(0, front), 400); } else { rect(front, H.top + 20, 460, 400); }
            fill(80, 160, 255, 230);
            beginShape();
            vertex(front - 40 * H.dir, 400);
            vertex(front - 40 * H.dir, H.top + 20);
            vertex(front - 10 * H.dir, H.top - 10 + sin(frameCount * 20) * 4);
            vertex(front + 20 * H.dir, H.top + 10);
            vertex(front + 20 * H.dir, 400);
            endShape(CLOSE);
            fill(230, 245, 255); for (var fm = 0; fm < 5; fm++) { ellipse(front + random(-20, 20), H.top - 4 + random(0, 14), 8, 6); }
            if (H.t === H.warn) { shake(6); }
            if (mouseY > H.top && abs(mouseX - front) < 34) { rnHurt(); }
            return false;
        }
        return true;
    }
    if (H.k === "cage") {
        var cr = H.r;
        if (H.t < H.warn) {
            stroke(255, 240, 90, (H.t % 8 < 4) ? 230 : 90); strokeWeight(2);
            for (var dsh = -cr; dsh < cr; dsh += 12) {
                line(H.x + dsh, H.y - cr, H.x + dsh + 6, H.y - cr); line(H.x + dsh, H.y + cr, H.x + dsh + 6, H.y + cr);
                line(H.x - cr, H.y + dsh, H.x - cr, H.y + dsh + 6); line(H.x + cr, H.y + dsh, H.x + cr, H.y + dsh + 6);
            }
            noStroke();
            fill(255, 240, 90, 30); rect(H.x - cr, H.y - cr, cr * 2, cr * 2);
            fill(255, 240, 120); textSize(11); textAlign(CENTER); text("GET OUT!", H.x, H.y - cr - 6);
            return false;
        }
        if (H.t < H.warn + H.dur) {
            if (H.t === H.warn) { shake(6); flash(255, 255, 220, 60); }
            drawLightningBolt(H.x - cr, H.y - cr, H.x + cr, H.y - cr, H.t, 255);
            drawLightningBolt(H.x + cr, H.y - cr, H.x + cr, H.y + cr, H.t + 7, 255);
            drawLightningBolt(H.x + cr, H.y + cr, H.x - cr, H.y + cr, H.t + 13, 255);
            drawLightningBolt(H.x - cr, H.y + cr, H.x - cr, H.y - cr, H.t + 21, 255);
            fill(255, 255, 200, 50); rect(H.x - cr, H.y - cr, cr * 2, cr * 2);
            if (abs(mouseX - H.x) < cr && abs(mouseY - H.y) < cr) { rnHurt(); }
            return false;
        }
        return true;
    }
    if (H.k === "pool") {
        if (H.t < H.warn) {
            noFill(); stroke(80, 170, 255, (H.t % 10 < 5) ? 220 : 90); strokeWeight(2);
            ellipse(H.x, H.y, H.r * 2, H.r * 2); noStroke();
            fill(60, 140, 255, 30); ellipse(H.x, H.y, H.r * 2, H.r * 2);
            return false;
        }
        if (H.t < H.warn + H.dur) {
            var sp = (H.t - H.warn) * 12;
            fill(30, 80, 180, 190); ellipse(H.x, H.y, H.r * 2, H.r * 1.6);
            for (var arm = 0; arm < 4; arm++) {
                for (var sg = 0; sg < 10; sg++) {
                    var aa = sp + arm * 90 + sg * 22;
                    var rr = H.r * (1 - sg / 11);
                    fill(150 + sg * 10, 210, 255, 200);
                    ellipse(H.x + cos(aa) * rr, H.y + sin(aa) * rr * 0.8, 6 - sg * 0.4, 6 - sg * 0.4);
                }
            }
            fill(10, 30, 80); ellipse(H.x, H.y, 16, 12);
            if (dist(mouseX, mouseY, H.x, H.y) < H.r) { rnHurt(); }
            return false;
        }
        return true;
    }
    if (H.k === "drop") {
        if (H.t < H.warn) {
            fill(0, 0, 0, 70); ellipse(H.x, 340, 20, 6);
            stroke(255, 255, 255, 60); strokeWeight(1); line(H.x, 0, H.x, 336); noStroke();
            return false;
        }
        H.y += 7;
        l9DrawSnackBag(H.x, H.y, H.c[0], H.c[1], H.c[2], H.t * 9);
        if (dist(mouseX, mouseY, H.x, H.y) < 16) { rnHurt(); }
        if (H.y > 345) { burst(H.x, 345, H.c[0], H.c[1], H.c[2], 6, 2, 0.15); return true; }
        return false;
    }
    if (H.k === "boom") {
        k = H.t / H.dur;
        var p = sin(k * 180);
        var bx2 = H.sx + (H.tx - H.sx) * p; var by2 = H.sy + (H.ty - H.sy) * p;
        var nx = -(H.ty - H.sy); var ny = H.tx - H.sx; var nl = max(1, sqrt(nx * nx + ny * ny));
        bx2 += nx / nl * sin(k * 360) * 40; by2 += ny / nl * sin(k * 360) * 40;
        if (H.t < 12) { noFill(); stroke(240, 230, 200, 160); strokeWeight(2); ellipse(H.tx, H.ty, 30, 30); noStroke(); }
        rnBone(bx2, by2, H.t * 25);
        if (dist(mouseX, mouseY, bx2, by2) < 16) { rnHurt(); }
        return H.t >= H.dur;
    }
    return true;
};
var rnResetFight = function() {
    rainEnd.php = 5; rainEnd.hurt = 0; rainEnd.lost = 0;
    rainEnd.hp = 1000; rainEnd.hits = 0; rainEnd.t = 0;
    rainEnd.atkT = 0; rainEnd.lastAtk = ""; rainEnd.hz = []; rainEnd.dmg = [];
    for (var i = 0; i < 9; i++) { rainEnd.bub[i].state = 0; rainEnd.bub[i].fall = 0; }
    l9Say("ROUND 2. (everyone got sucked back in)", 200, 360);
};
var rnHeart = function(x, y, full) {
    noStroke();
    if (full) { fill(255, 60, 90); } else { fill(60, 40, 50); }
    ellipse(x - 3.5, y - 2, 9, 9); ellipse(x + 3.5, y - 2, 9, 9);
    triangle(x - 8, y, x + 8, y, x, y + 9);
    if (full) { fill(255, 200, 210); ellipse(x - 4, y - 4, 3, 3); }
};
// ============ THE RAIN AREA (unlocked when you beat the Storm Fish. finish it = the HUGE storm) ============
var RA_DROPC = [[70, 140, 255], [170, 90, 235], [50, 200, 180], [225, 225, 240]];
var rainZone = {room: 0, solved: 0, made: -1};
var raBg = function() {
    noStroke();
    background(40, 60, 96);
    for (var y = 0; y < 400; y += 20) { fill(40 + y * 0.05, 60 + y * 0.06, 96 + y * 0.08); rect(0, y, 400, 20); }
    // clouds
    for (var c = 0; c < 6; c++) {
        var cx = (c * 83 + frameCount * 0.25) % 480 - 40; var cy = 26 + (c % 3) * 12;
        fill(90, 100, 130); ellipse(cx, cy + 6, 90, 30);
        fill(120, 130, 160); ellipse(cx - 20, cy, 50, 32); ellipse(cx + 14, cy - 6, 56, 36);
    }
    // the rain
    stroke(170, 200, 255, 120); strokeWeight(1.2);
    for (var r = 0; r < 50; r++) {
        var rx = (r * 47 + frameCount * 2) % 420 - 10; var ry = (r * 83 + frameCount * 9) % 420 - 20;
        line(rx, ry, rx - 3, ry + 12);
    }
    noStroke();
    // wet ground + puddle ripples
    fill(30, 44, 70); rect(0, 370, 400, 30);
    noFill(); stroke(150, 190, 255, 120); strokeWeight(1);
    for (var p = 0; p < 5; p++) { var rr = (frameCount * 0.8 + p * 23) % 40; ellipse(30 + p * 85, 386, rr, rr * 0.3); }
    noStroke();
};
var raTitle = function(name, sub) {
    noStroke();
    fill(20, 40, 80, 220); rect(60, 46, 280, 34, 6);
    fill(150, 200, 255); rect(60, 46, 280, 3, 6);
    fill(220, 235, 255); textSize(13); textAlign(CENTER); text(name, 200, 62);
    fill(170, 200, 240); textSize(8);
    var sw = textWidth(sub); if (sw > 272) { textSize(8 * 272 / sw); }
    text(sub, 200, 74);
};
// ---- R-1: PUDDLE HOP. from a puddle you must jump EXACTLY its number of puddles (straight line) ----
var raMakeHop = function() {
    var A = rainZone;
    for (var tries = 0; tries < 500; tries++) {
        var g = [];
        for (var i = 0; i < 25; i++) { g.push(1 + floor(random(0, 4))); }
        var d = []; for (var k = 0; k < 25; k++) { d.push(-1); }
        d[0] = 0; var q = [0];
        while (q.length > 0) {
            var u = q.shift(); var r = floor(u / 5); var c = u % 5; var n = g[u];
            var nb = [[r - n, c], [r + n, c], [r, c - n], [r, c + n]];
            for (var m = 0; m < 4; m++) {
                if (nb[m][0] < 0 || nb[m][0] > 4 || nb[m][1] < 0 || nb[m][1] > 4) { continue; }
                var v = nb[m][0] * 5 + nb[m][1];
                if (d[v] < 0) { d[v] = d[u] + 1; q.push(v); }
            }
        }
        if (d[24] >= 7) { A.hop = g; A.at = 0; A.hops = 0; A.hopT = 0; A.from = 0; return; }
    }
    A.hop = [3, 1, 2, 3, 2, 2, 1, 3, 1, 3, 3, 2, 2, 1, 1, 1, 3, 3, 2, 2, 3, 1, 1, 2, 1]; A.at = 0; A.hops = 0; A.hopT = 0; A.from = 0;
};
var raHopOK = function(from, to) {
    var n = rainZone.hop[from];
    var r1 = floor(from / 5); var c1 = from % 5; var r2 = floor(to / 5); var c2 = to % 5;
    return (r1 === r2 && abs(c1 - c2) === n) || (c1 === c2 && abs(r1 - r2) === n);
};
var RA_HX = 70;
var RA_HY = 100;
var RA_HS = 52;
var drawRaHop = function() {
    var A = rainZone; var i;
    raTitle("R-1  PUDDLE HOP", "from a puddle, you must hop EXACTLY that many puddles (straight). reach the cloud!");
    for (i = 0; i < 25; i++) {
        var x = RA_HX + (i % 5) * RA_HS + RA_HS / 2; var y = RA_HY + floor(i / 5) * RA_HS + RA_HS / 2;
        fill(20, 34, 60); ellipse(x, y + 3, 44, 30);
        fill(60, 110, 190); ellipse(x, y, 42, 28);
        fill(110, 170, 240, 160); ellipse(x - 8, y - 5, 14, 6);
        noFill(); stroke(170, 210, 255, 120); strokeWeight(1);
        var rr = (frameCount * 0.6 + i * 9) % 30; ellipse(x, y, rr, rr * 0.6); noStroke();
        if (i === 24) {
            fill(240, 245, 255); ellipse(x - 8, y - 4, 22, 16); ellipse(x + 6, y - 7, 22, 18); ellipse(x + 2, y + 2, 30, 14);
            fill(60, 80, 120); textSize(8); textAlign(CENTER); text("HOME", x, y + 4);
        } else {
            fill(230, 240, 255); textSize(16); textAlign(CENTER); text("" + A.hop[i], x, y + 6);
        }
        if (!A.solved && A.hopT === 0 && raHopOK(A.at, i)) { noFill(); stroke(255, 255, 160, 120 + sin(frameCount * 8) * 80); strokeWeight(2); ellipse(x, y, 48, 34); noStroke(); }
    }
    // you (a little raindrop), hopping
    var tx = RA_HX + (A.at % 5) * RA_HS + RA_HS / 2; var ty = RA_HY + floor(A.at / 5) * RA_HS + RA_HS / 2;
    var px = tx; var py = ty;
    if (A.hopT > 0) {
        A.hopT--;
        var k = 1 - A.hopT / 18;
        var fx = RA_HX + (A.from % 5) * RA_HS + RA_HS / 2; var fy = RA_HY + floor(A.from / 5) * RA_HS + RA_HS / 2;
        px = fx + (tx - fx) * k; py = fy + (ty - fy) * k - sin(k * 180) * 30;
        if (A.hopT === 0) {
            burst(tx, ty, 150, 200, 255, 8, 2, 0.1);
            if (A.at === 24) { A.solved = 1; flash(170, 220, 255, 90); l9Say("you made it HOME! ( > )", 200, 360); }
        }
    }
    srDrawDropAt(px, py - 14, 1);
    fill(20, 40, 80, 200); rect(150, 372, 100, 20, 5);
    fill(220, 235, 255); textSize(10); textAlign(CENTER); text("START OVER", 200, 386);
    fill(200, 220, 255); textSize(9); text("hops: " + A.hops, 340, 386);
};
var raHopPressed = function() {
    var A = rainZone;
    if (mouseX > 150 && mouseX < 250 && mouseY > 372 && mouseY < 392) { A.at = 0; A.hops = 0; A.hopT = 0; return; }
    if (A.hopT > 0) { return; }
    var c = floor((mouseX - RA_HX) / RA_HS); var r = floor((mouseY - RA_HY) / RA_HS);
    if (c < 0 || r < 0 || c > 4 || r > 4) { return; }
    var to = r * 5 + c;
    if (raHopOK(A.at, to)) { A.from = A.at; A.at = to; A.hops++; A.hopT = 18; }
    else if (to !== A.at) { l9Say("you have to hop EXACTLY " + A.hop[A.at] + ", in a straight line.", 200, 360); }
};
// ---- R-2: RAINDROP SORT. pour drops between tubes until every tube is one color ----
var raMakeSort = function() {
    var A = rainZone;
    var t = [[0, 0, 0, 0], [1, 1, 1, 1], [2, 2, 2, 2], [3, 3, 3, 3], [], []];
    // scramble it by doing the moves BACKWARDS (so it can always be solved)
    for (var m = 0; m < 400; m++) {
        var from = floor(random(0, 6)); var to = floor(random(0, 6));
        if (from === to || t[from].length === 0 || t[to].length >= 4) { continue; }
        var top = t[from][t[from].length - 1];
        var under = t[from].length > 1 ? t[from][t[from].length - 2] : -1;
        if (under !== -1 && under !== top) { continue; }
        t[to].push(t[from].pop());
    }
    var mixed = 0;
    for (var i = 0; i < 6; i++) { for (var j = 1; j < t[i].length; j++) { if (t[i][j] !== t[i][0]) { mixed++; break; } } }
    if (mixed < 3) { raMakeSort(); return; }
    A.tubes = t; A.start = []; for (var k = 0; k < 6; k++) { A.start.push(t[k].slice(0)); }
    A.sel = -1; A.pours = 0;
};
var raSortDone = function(t) {
    for (var i = 0; i < t.length; i++) {
        if (t[i].length === 0) { continue; }
        if (t[i].length !== 4) { return false; }
        for (var j = 1; j < 4; j++) { if (t[i][j] !== t[i][0]) { return false; } }
    }
    return true;
};
var raPour = function(t, a, b) {
    if (a === b || t[a].length === 0 || t[b].length >= 4) { return 0; }
    var c = t[a][t[a].length - 1];
    if (t[b].length > 0 && t[b][t[b].length - 1] !== c) { return 0; }
    var n = 0;
    while (t[a].length > 0 && t[a][t[a].length - 1] === c && t[b].length < 4) { t[b].push(t[a].pop()); n++; }
    return n;
};
var drawRaDrop = function(x, y, c, s) {
    var C = RA_DROPC[c];
    noStroke();
    fill(C[0], C[1], C[2]); ellipse(x, y + 3 * s, 22 * s, 22 * s); triangle(x - 10 * s, y, x + 10 * s, y, x, y - 16 * s);
    fill(255, 255, 255, 150); ellipse(x - 4 * s, y + 1 * s, 5 * s, 7 * s);
};
var drawRaSort = function() {
    var A = rainZone; var i; var j;
    raTitle("R-2  RAINDROP SORT", "click a tube, then another to pour. same color on top (or empty) only!");
    for (i = 0; i < 6; i++) {
        var x = 60 + i * 56; var by = 320;
        fill(200, 220, 255, 40); rect(x - 20, by - 168, 40, 172, 10);
        noFill(); stroke(200, 225, 255, A.sel === i ? 255 : 140); strokeWeight(A.sel === i ? 3 : 2); rect(x - 20, by - 168, 40, 172, 10); noStroke();
        for (j = 0; j < A.tubes[i].length; j++) {
            var lift = (A.sel === i && j === A.tubes[i].length - 1) ? -30 : 0;
            drawRaDrop(x, by - 18 - j * 40 + lift, A.tubes[i][j], 1.1);
        }
    }
    fill(20, 40, 80, 200); rect(160, 346, 80, 20, 5);
    fill(220, 235, 255); textSize(10); textAlign(CENTER); text("RESET", 200, 360);
    fill(200, 220, 255); textSize(9); text("pours: " + A.pours, 340, 360);
};
var raSortPressed = function() {
    var A = rainZone;
    if (mouseX > 160 && mouseX < 240 && mouseY > 346 && mouseY < 366) {
        for (var k = 0; k < 6; k++) { A.tubes[k] = A.start[k].slice(0); }
        A.sel = -1; A.pours = 0; return;
    }
    for (var i = 0; i < 6; i++) {
        var x = 60 + i * 56;
        if (abs(mouseX - x) < 24 && mouseY > 140 && mouseY < 330) {
            if (A.sel < 0) { if (A.tubes[i].length > 0) { A.sel = i; } }
            else if (A.sel === i) { A.sel = -1; }
            else {
                var n = raPour(A.tubes, A.sel, i);
                if (n > 0) { A.pours++; burst(x, 160, 150, 200, 255, 6, 1.5, 0.1); } else { l9Say("*splash* that drop doesn't go there.", 200, 360); }
                A.sel = -1;
                if (raSortDone(A.tubes)) { A.solved = 1; flash(170, 220, 255, 90); l9Say("every tube is sorted! ( > )", 200, 360); }
            }
            return;
        }
    }
};
// ---- R-3: UMBRELLAS. every person needs ONE umbrella next to them. umbrellas never touch (not even corners). ----
var raUmbAll = function(people, rowN, colN, limit) {
    // finds every umbrella layout that works (stops at 'limit')
    var found = []; var keys = {};
    var used = []; for (var u = 0; u < 36; u++) { used.push(0); }
    var isP = []; for (var p0 = 0; p0 < 36; p0++) { isP.push(0); }
    for (var p1 = 0; p1 < people.length; p1++) { isP[people[p1]] = 1; }
    var rc = [0, 0, 0, 0, 0, 0]; var cc = [0, 0, 0, 0, 0, 0];
    var go = function(k) {
        if (found.length >= limit) { return; }
        if (k === people.length) {
            for (var z = 0; z < 6; z++) { if (rc[z] !== rowN[z] || cc[z] !== colN[z]) { return; } }
            var key = ""; for (var y = 0; y < 36; y++) { key += used[y]; }
            if (!keys[key]) { keys[key] = 1; found.push(used.slice(0)); }
            return;
        }
        var pr = floor(people[k] / 6); var pc = people[k] % 6;
        var opts = [[pr - 1, pc], [pr + 1, pc], [pr, pc - 1], [pr, pc + 1]];
        for (var o = 0; o < 4; o++) {
            var r = opts[o][0]; var c = opts[o][1];
            if (r < 0 || r > 5 || c < 0 || c > 5) { continue; }
            var i = r * 6 + c;
            if (isP[i] || used[i]) { continue; }
            if (rc[r] >= rowN[r] || cc[c] >= colN[c]) { continue; }
            var touch = false;
            for (var dr = -1; dr <= 1 && !touch; dr++) {
                for (var dc = -1; dc <= 1; dc++) {
                    var rr = r + dr; var c2 = c + dc;
                    if (rr >= 0 && rr < 6 && c2 >= 0 && c2 < 6 && used[rr * 6 + c2]) { touch = true; break; }
                }
            }
            if (touch) { continue; }
            used[i] = 1; rc[r]++; cc[c]++;
            go(k + 1);
            used[i] = 0; rc[r]--; cc[c]--;
        }
    };
    go(0);
    return found;
};
var raMakeUmb = function() {
    var A = rainZone;
    for (var tries = 0; tries < 400; tries++) {
        var um = []; var used = []; for (var u = 0; u < 36; u++) { used.push(0); }
        for (var t = 0; t < 200 && um.length < 7; t++) {
            var i = floor(random(0, 36)); var r = floor(i / 6); var c = i % 6;
            var bad = used[i] !== 0;
            for (var dr = -1; dr <= 1 && !bad; dr++) { for (var dc = -1; dc <= 1; dc++) { var rr = r + dr; var cc2 = c + dc; if (rr >= 0 && rr < 6 && cc2 >= 0 && cc2 < 6 && used[rr * 6 + cc2] === 1) { bad = true; } } }
            if (!bad) { used[i] = 1; um.push(i); }
        }
        if (um.length < 7) { continue; }
        var people = []; var ok = true;
        for (var k = 0; k < um.length && ok; k++) {
            var ur = floor(um[k] / 6); var uc = um[k] % 6;
            var opts = [];
            var nb = [[ur - 1, uc], [ur + 1, uc], [ur, uc - 1], [ur, uc + 1]];
            for (var o = 0; o < 4; o++) { if (nb[o][0] >= 0 && nb[o][0] < 6 && nb[o][1] >= 0 && nb[o][1] < 6 && used[nb[o][0] * 6 + nb[o][1]] === 0) { opts.push(nb[o][0] * 6 + nb[o][1]); } }
            if (opts.length === 0) { ok = false; break; }
            var pk = opts[floor(random(0, opts.length))];
            used[pk] = 2; people.push(pk);
        }
        if (!ok) { continue; }
        var rowN = [0, 0, 0, 0, 0, 0]; var colN = [0, 0, 0, 0, 0, 0];
        for (var q = 0; q < um.length; q++) { rowN[floor(um[q] / 6)]++; colN[um[q] % 6]++; }
        var sols = raUmbAll(people, rowN, colN, 2);
        if (sols.length === 1) {
            A.people = people; A.rowN = rowN; A.colN = colN; A.umbSol = sols[0];
            A.cells = []; for (var z = 0; z < 36; z++) { A.cells.push(0); }
            return;
        }
    }
};
var RA_UX = 96;
var RA_UY = 112;
var RA_US = 38;
var drawRaUmb = function() {
    var A = rainZone; var i;
    raTitle("R-3  UMBRELLAS", "every person gets ONE umbrella next to them. umbrellas never touch (not even corners).");
    fill(200, 220, 255); textSize(8); textAlign(CENTER); text("numbers = how many umbrellas in that row / column.   click: umbrella > dot > empty", 200, 96);
    for (i = 0; i < 36; i++) {
        var x = RA_UX + (i % 6) * RA_US; var y = RA_UY + floor(i / 6) * RA_US;
        fill(40, 70, 50); rect(x + 1, y + 1, RA_US - 2, RA_US - 2, 3);
        fill(55, 90, 60); rect(x + 1, y + 1, RA_US - 2, 5, 3);
        var cx = x + RA_US / 2; var cy = y + RA_US / 2;
        if (A.people.indexOf(i) >= 0) {
            fill(240, 200, 160); ellipse(cx, cy - 8, 12, 12);
            fill(220, 80, 80); rect(cx - 6, cy - 2, 12, 14, 3);
            fill(30); ellipse(cx - 2, cy - 9, 2, 2); ellipse(cx + 2, cy - 9, 2, 2);
            fill(150, 200, 255); ellipse(cx + 7, cy - 14 + (frameCount % 20) / 2, 2, 4);
        } else if (A.cells[i] === 1) {
            fill(60, 90, 220); arc(cx, cy + 2, 30, 24, 180, 360);
            fill(90, 130, 255); arc(cx - 6, cy + 2, 10, 10, 180, 360); arc(cx + 6, cy + 2, 10, 10, 180, 360);
            stroke(60, 40, 30); strokeWeight(2); line(cx, cy + 2, cx, cy + 13); noFill(); arc(cx - 3, cy + 13, 6, 6, 0, 180); noStroke();
        } else if (A.cells[i] === 2) {
            fill(150, 200, 150); ellipse(cx, cy, 5, 5);
        }
    }
    textSize(14);
    for (i = 0; i < 6; i++) {
        var nr = 0; var nc = 0;
        for (var k = 0; k < 6; k++) { if (A.cells[i * 6 + k] === 1) { nr++; } if (A.cells[k * 6 + i] === 1) { nc++; } }
        fill(nr > A.rowN[i] ? 255 : 220, nr > A.rowN[i] ? 120 : 235, nr > A.rowN[i] ? 120 : 255);
        text("" + A.rowN[i], RA_UX - 14, RA_UY + i * RA_US + RA_US / 2 + 5);
        fill(nc > A.colN[i] ? 255 : 220, nc > A.colN[i] ? 120 : 235, nc > A.colN[i] ? 120 : 255);
        text("" + A.colN[i], RA_UX + i * RA_US + RA_US / 2, RA_UY - 4);
    }
};
var raUmbPressed = function() {
    var A = rainZone;
    var c = floor((mouseX - RA_UX) / RA_US); var r = floor((mouseY - RA_UY) / RA_US);
    if (c < 0 || r < 0 || c > 5 || r > 5) { return; }
    var i = r * 6 + c;
    if (A.people.indexOf(i) >= 0) { l9Say("\"i'm getting WET over here!\"", 200, 360); return; }
    A.cells[i] = (A.cells[i] + 1) % 3;
    for (var k = 0; k < 36; k++) { if ((A.cells[k] === 1 ? 1 : 0) !== A.umbSol[k]) { return; } }
    A.solved = 1; flash(170, 220, 255, 90); l9Say("everybody is dry! ( > )", 200, 360);
};
// ---- the rain area: draw + clicks ----
// ---------- MORE RAIN AREA ROOMS (R-4 to R-6) ----------
var RA_BRIDGES = [[[0,3,0,6,2,3,2,5,3,0,3,4,3,6,5,0,5,3,5,6],[1,2,2,1,2,1,4,3,3,3],[0,1,0,2,1,6,2,3,2,8,4,5,4,7,5,6,6,9,7,8,8,9],[1,0,1,1,1,0,2,1,2,1,1]],[[0,0,0,3,0,6,3,3,4,0,4,4,4,6,5,3,6,0,6,4],[3,4,3,2,2,1,2,1,3,3],[0,1,0,4,1,2,1,3,2,6,3,7,4,5,4,8,5,6,5,9,8,9],[2,1,1,1,2,1,0,1,0,1,2]],[[0,6,1,1,1,5,3,1,3,3,3,6,5,3,6,1,6,4,6,6],[1,2,1,5,5,5,1,3,1,2],[0,5,1,2,1,3,3,4,3,7,4,5,4,6,5,9,7,8,8,9],[1,1,1,2,2,2,1,2,1,0]],[[0,0,0,2,0,4,2,1,2,4,3,0,5,1,5,3,6,0,6,4],[1,3,3,3,4,1,3,1,2,3],[0,1,0,5,1,2,2,4,3,4,3,6,4,9,5,8,6,7,8,9],[1,0,2,1,1,2,2,1,1,1]],[[1,1,1,4,2,6,3,0,3,2,4,1,4,4,6,0,6,4,6,6],[2,4,2,3,1,2,5,3,3,3],[0,1,0,5,1,6,2,9,3,4,3,7,5,6,6,8,7,8,8,9],[2,0,2,2,1,2,2,1,1,1]],[[0,2,0,4,0,6,2,6,3,2,3,4,5,2,5,6,6,0,6,4],[3,6,4,4,2,4,1,2,2,4],[0,1,0,4,1,2,1,5,2,3,3,7,4,5,4,6,5,9,6,7,8,9],[2,1,2,2,2,2,0,1,2,0,2]],[[1,1,1,4,1,6,2,0,3,2,4,1,4,4,5,0,5,2,5,6],[2,3,2,1,1,1,1,3,4,2],[0,1,0,5,1,2,1,6,2,9,3,7,4,8,5,6,7,8,8,9],[1,1,1,1,1,1,1,0,2,1]],[[1,0,1,3,1,5,2,6,3,0,3,2,3,5,5,0,5,3,5,6],[1,2,2,2,4,2,1,2,4,4],[0,1,0,4,1,2,1,8,2,6,3,9,4,5,4,7,5,6,7,8,8,9],[0,1,1,1,1,2,2,1,0,1,2]]];
var RA_MINES = [[[3,4,8,12,27,31,39,42,48,50,55],61],[[20,22,23,29,32,41,42,47,54,57,58],10],[[0,1,8,12,13,25,33,39,54,55,60],48],[[7,9,11,16,23,24,27,29,32,35,42],45],[[4,9,13,15,19,20,25,33,39,49,56],44],[[5,15,24,26,37,39,41,45,47,48,55],43],[[11,13,26,29,31,39,48,50,54,57,60],24],[[6,11,15,17,38,42,45,56,57,61,63],28]];
// ---- R-4: THUNDER BRIDGES. connect the clouds with lightning bridges ----
var RA_BX = 60;
var RA_BY = 96;
var RA_BS = 40;
var raBridgePt = function(i) { var B = rainZone.br; return [RA_BX + B.isl[i * 2 + 1] * RA_BS + RA_BS / 2, RA_BY + B.isl[i * 2] * RA_BS + RA_BS / 2]; };
var raBridgeCross = function(e1, e2) {
    var B = rainZone.br;
    var a = B.edges[e1 * 2]; var b = B.edges[e1 * 2 + 1]; var c = B.edges[e2 * 2]; var d = B.edges[e2 * 2 + 1];
    var ar = B.isl[a * 2]; var ac = B.isl[a * 2 + 1]; var br = B.isl[b * 2]; var bc = B.isl[b * 2 + 1];
    var cr = B.isl[c * 2]; var cc = B.isl[c * 2 + 1]; var dr = B.isl[d * 2]; var dc = B.isl[d * 2 + 1];
    var h1 = ar === br; var h2 = cr === dr;
    if (h1 === h2) { return false; }
    if (!h1) { var t; t = ar; ar = cr; cr = t; t = ac; ac = cc; cc = t; t = br; br = dr; dr = t; t = bc; bc = dc; dc = t; }
    return min(ac, bc) < cc && cc < max(ac, bc) && min(cr, dr) < ar && ar < max(cr, dr);
};
var raBridgeDeg = function(i) {
    var B = rainZone.br; var n = 0;
    for (var e = 0; e < B.val.length; e++) { if (B.edges[e * 2] === i || B.edges[e * 2 + 1] === i) { n += B.val[e]; } }
    return n;
};
var drawRaBridges = function() {
    var A = rainZone; var B = A.br; var i; var e;
    raTitle("R-4  THUNDER BRIDGES", "click between 2 clouds to add a bridge (1 or 2). the number = how many bridges touch it.");
    fill(200, 220, 255); textSize(8); textAlign(CENTER); text("bridges go straight, can't cross, and EVERY cloud must be connected.", 200, 90);
    for (e = 0; e < B.val.length; e++) {
        var p = raBridgePt(B.edges[e * 2]); var q = raBridgePt(B.edges[e * 2 + 1]);
        if (B.val[e] === 0) { stroke(150, 180, 230, 40); strokeWeight(1); line(p[0], p[1], q[0], q[1]); noStroke(); continue; }
        var horiz = abs(p[1] - q[1]) < 1;
        for (var k = 0; k < B.val[e]; k++) {
            var off = B.val[e] === 2 ? (k === 0 ? -4 : 4) : 0;
            stroke(255, 230, 80, 220); strokeWeight(3);
            if (horiz) { line(p[0], p[1] + off, q[0], q[1] + off); } else { line(p[0] + off, p[1], q[0] + off, q[1]); }
            stroke(255, 255, 220); strokeWeight(1);
            if (horiz) { line(p[0], p[1] + off, q[0], q[1] + off); } else { line(p[0] + off, p[1], q[0] + off, q[1]); }
        }
        noStroke();
    }
    for (i = 0; i < B.num.length; i++) {
        var c = raBridgePt(i);
        var dg = raBridgeDeg(i);
        var done = dg === B.num[i]; var over = dg > B.num[i];
        fill(60, 70, 100); ellipse(c[0], c[1] + 3, 34, 26);
        fill(over ? 255 : (done ? 200 : 235), over ? 150 : (done ? 255 : 240), over ? 150 : (done ? 200 : 255));
        ellipse(c[0] - 6, c[1], 18, 16); ellipse(c[0] + 6, c[1] - 2, 20, 18); ellipse(c[0], c[1] + 4, 30, 14);
        fill(40, 60, 100); textSize(14); textAlign(CENTER); text("" + B.num[i], c[0], c[1] + 6);
    }
};
var raBridgePressed = function() {
    var A = rainZone; var B = A.br;
    var best = -1; var bd = 12;
    for (var e = 0; e < B.val.length; e++) {
        var p = raBridgePt(B.edges[e * 2]); var q = raBridgePt(B.edges[e * 2 + 1]);
        var horiz = abs(p[1] - q[1]) < 1;
        var d;
        if (horiz) { d = (mouseX > min(p[0], q[0]) + 14 && mouseX < max(p[0], q[0]) - 14) ? abs(mouseY - p[1]) : 99; }
        else { d = (mouseY > min(p[1], q[1]) + 14 && mouseY < max(p[1], q[1]) - 14) ? abs(mouseX - p[0]) : 99; }
        if (d < bd) { bd = d; best = e; }
    }
    if (best < 0) { return; }
    var nv = (B.val[best] + 1) % 3;
    if (nv > 0 && B.val[best] === 0) {
        for (var f = 0; f < B.val.length; f++) {
            if (B.val[f] > 0 && raBridgeCross(best, f)) { l9Say("*ZZT* bridges can't cross each other!", 200, 360); return; }
        }
    }
    B.val[best] = nv;
    for (var s = 0; s < B.val.length; s++) { if (B.val[s] !== B.sol[s]) { return; } }
    A.solved = 1; flash(255, 240, 150, 100); l9Say("every cloud is connected! ( > )", 200, 360);
};
// ---- R-5: CLOUD SWEEPER. some clouds hide LIGHTNING. numbers = how many lightning clouds touch it ----
var RA_SX = 64;
var RA_SY = 100;
var RA_SS = 34;
var raSweepNum = function(i) {
    var r = floor(i / 8); var c = i % 8; var n = 0;
    for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
            var rr = r + dr; var cc = c + dc;
            if ((dr !== 0 || dc !== 0) && rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && rainZone.sw.mine[rr * 8 + cc]) { n++; }
        }
    }
    return n;
};
var raSweepReveal = function(i) {
    var S = rainZone.sw; var st = [i];
    while (st.length > 0) {
        var u = st.pop();
        if (S.open[u] || S.mine[u]) { continue; }
        S.open[u] = 1; S.flag[u] = 0;
        if (raSweepNum(u) === 0) {
            var r = floor(u / 8); var c = u % 8;
            for (var dr = -1; dr <= 1; dr++) {
                for (var dc = -1; dc <= 1; dc++) {
                    var rr = r + dr; var cc = c + dc;
                    if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && !S.open[rr * 8 + cc]) { st.push(rr * 8 + cc); }
                }
            }
        }
    }
};
var raSweepStart = function() {
    var S = rainZone.sw;
    S.open = []; S.flag = [];
    for (var i = 0; i < 64; i++) { S.open.push(0); S.flag.push(0); }
    raSweepReveal(S.start);
};
var drawRaSweep = function() {
    var A = rainZone; var S = A.sw; var i;
    raTitle("R-5  CLOUD SWEEPER", "11 clouds hide LIGHTNING. a number = how many lightning clouds touch that spot.");
    fill(200, 220, 255); textSize(8); textAlign(CENTER); text("open every SAFE cloud. use FLAG mode to mark the lightning ones. (no guessing needed!)", 200, 94);
    var NC = [[90, 160, 255], [90, 210, 120], [255, 120, 120], [190, 120, 255], [255, 170, 60], [80, 220, 220], [240, 240, 240], [200, 200, 200]];
    for (i = 0; i < 64; i++) {
        var x = RA_SX + (i % 8) * RA_SS; var y = RA_SY + floor(i / 8) * RA_SS;
        if (S.open[i]) {
            fill(30, 46, 80); rect(x + 1, y + 1, RA_SS - 2, RA_SS - 2, 3);
            var n = raSweepNum(i);
            if (n > 0) { var nc = NC[n - 1]; fill(nc[0], nc[1], nc[2]); textSize(16); textAlign(CENTER); text("" + n, x + RA_SS / 2, y + RA_SS / 2 + 6); }
        } else {
            fill(110, 125, 160); rect(x + 1, y + 1, RA_SS - 2, RA_SS - 2, 6);
            fill(170, 185, 215); ellipse(x + 11, y + 15, 14, 12); ellipse(x + 21, y + 12, 16, 14); ellipse(x + 17, y + 20, 22, 10);
            if (S.flag[i]) {
                stroke(255, 230, 60); strokeWeight(3);
                line(x + 18, y + 6, x + 12, y + 18); line(x + 12, y + 18, x + 20, y + 18); line(x + 20, y + 18, x + 14, y + 29);
                noStroke();
            }
            if (S.zap > 0 && S.mine[i]) { fill(255, 240, 80, S.zap * 6); rect(x + 1, y + 1, RA_SS - 2, RA_SS - 2, 6); }
        }
    }
    if (S.zap > 0) { S.zap--; }
    fill(S.mode ? 120 : 40, S.mode ? 90 : 70, S.mode ? 20 : 120); rect(140, 378, 120, 18, 5);
    fill(255); textSize(10); textAlign(CENTER); text(S.mode ? "MODE: FLAG  (click)" : "MODE: OPEN  (click)", 200, 391);
};
var raSweepPressed = function() {
    var A = rainZone; var S = A.sw;
    if (mouseX > 140 && mouseX < 260 && mouseY > 376 && mouseY < 398) { S.mode = 1 - S.mode; return; }
    var c = floor((mouseX - RA_SX) / RA_SS); var r = floor((mouseY - RA_SY) / RA_SS);
    if (c < 0 || r < 0 || c > 7 || r > 7) { return; }
    var i = r * 8 + c;
    if (S.open[i]) { return; }
    if (S.mode) { S.flag[i] = 1 - S.flag[i]; return; }
    if (S.flag[i]) { l9Say("that one's flagged. (switch to FLAG mode to un-flag it)", 200, 370); return; }
    if (S.mine[i]) {
        S.zap = 45; shake(10); flash(255, 250, 150, 160);
        l9Say("*ZAP!!* that was a lightning cloud! (the clouds close back up)", 200, 370);
        raSweepStart();
        return;
    }
    raSweepReveal(i);
    for (var k = 0; k < 64; k++) { if (!S.mine[k] && !S.open[k]) { return; } }
    A.solved = 1; flash(170, 220, 255, 100); l9Say("every safe cloud is open! ( > )", 200, 370);
};
// ---- R-6: FLOOD THE SKY. turn the whole sky ONE color, starting from the top-left ----
var RA_FCOL = [[70, 140, 255], [170, 90, 235], [50, 200, 180], [230, 230, 245], [255, 130, 190]];
var raFloodRegion = function(g, col) {
    var seen = []; for (var i = 0; i < 100; i++) { seen.push(0); }
    var st = [0]; var n = 0; var c0 = g[0];
    while (st.length > 0) {
        var u = st.pop();
        if (seen[u] || g[u] !== c0) { continue; }
        seen[u] = 1; n++;
        var r = floor(u / 10); var c = u % 10;
        if (r > 0) { st.push(u - 10); } if (r < 9) { st.push(u + 10); } if (c > 0) { st.push(u - 1); } if (c < 9) { st.push(u + 1); }
    }
    if (col >= 0) { for (var k = 0; k < 100; k++) { if (seen[k]) { g[k] = col; } } }
    return n;
};
var raFloodBest = function(g) {
    // looks 2 moves ahead and picks the best color
    var best = -1; var bn = -1;
    for (var a = 0; a < 5; a++) {
        if (a === g[0]) { continue; }
        var g1 = g.slice(0); raFloodRegion(g1, a);
        var n1 = raFloodRegion(g1, -1);
        if (n1 === 100) { return a; }
        for (var b = 0; b < 5; b++) {
            if (b === a) { continue; }
            var g2 = g1.slice(0); raFloodRegion(g2, b);
            var n2 = raFloodRegion(g2, -1) * 10 + n1;
            if (n2 > bn) { bn = n2; best = a; }
        }
    }
    return best;
};
var raFloodSolve = function(g0) {
    var g = g0.slice(0); var moves = [];
    while (raFloodRegion(g, -1) < 100 && moves.length < 60) { var m = raFloodBest(g); moves.push(m); raFloodRegion(g, m); }
    return moves;
};
var drawRaFlood = function() {
    var A = rainZone; var F = A.fl; var i;
    raTitle("R-6  FLOOD THE SKY", "pick a color: the top-left patch becomes that color (and grabs matching neighbors).");
    fill(200, 220, 255); textSize(8); textAlign(CENTER); text("make the WHOLE sky one color in " + F.limit + " moves or less!", 200, 94);
    var x0 = 46; var y0 = 100; var S = 26;
    for (i = 0; i < 100; i++) {
        var c = RA_FCOL[F.g[i]];
        fill(c[0], c[1], c[2]); rect(x0 + (i % 10) * S, y0 + floor(i / 10) * S, S, S);
    }
    noFill(); stroke(255, 255, 255, 150 + sin(frameCount * 8) * 100); strokeWeight(2); rect(x0, y0, S, S); noStroke();
    fill(255); textSize(7); textAlign(CENTER); text("START", x0 + S / 2, y0 - 3);
    for (i = 0; i < 5; i++) {
        var cc = RA_FCOL[i];
        fill(20, 30, 60); ellipse(90 + i * 55, 378, 34, 34);
        fill(cc[0], cc[1], cc[2]); ellipse(90 + i * 55, 378, 28, 28);
        fill(255, 255, 255, 120); ellipse(85 + i * 55, 372, 8, 6);
    }
    fill(220, 235, 255); textSize(10); textAlign(CENTER); text("moves:", 344, 130); textSize(16); text(F.moves + " / " + F.limit, 344, 150);
    fill(20, 40, 80, 200); rect(316, 160, 56, 18, 4);
    fill(220, 235, 255); textSize(9); textAlign(CENTER); text("RESET", 344, 173);
};
var raFloodPressed = function() {
    var A = rainZone; var F = A.fl;
    if (mouseX > 316 && mouseX < 372 && mouseY > 160 && mouseY < 178) { F.g = F.start.slice(0); F.moves = 0; return; }
    for (var i = 0; i < 5; i++) {
        if (dist(mouseX, mouseY, 90 + i * 55, 378) < 18) {
            if (i === F.g[0]) { return; }
            raFloodRegion(F.g, i); F.moves++;
            if (raFloodRegion(F.g, -1) === 100) {
                if (F.moves <= F.limit) { A.solved = 1; flash(170, 220, 255, 100); l9Say("the whole sky is ONE color! ( > )", 200, 360); }
                else { l9Say("too many moves! (" + F.moves + "). try again.", 200, 360); F.g = F.start.slice(0); F.moves = 0; }
            } else if (F.moves >= F.limit) {
                l9Say("out of moves! the sky resets.", 200, 360); shake(4);
                F.g = F.start.slice(0); F.moves = 0;
            }
            return;
        }
    }
};
// ---------- EVEN MORE RAIN AREA ROOMS (R-7 to R-9) ----------
// ---- R-7: PEG HOP. jump a raindrop over another one into an empty puddle. end with just ONE ----
var RA_PEG_RC = [];
for (var prr = 0; prr < 5; prr++) { for (var pcc = 0; pcc <= prr; pcc++) { RA_PEG_RC.push([prr, pcc]); } }
var raPegIdx = function(r, c) { if (r < 0 || r > 4 || c < 0 || c > r) { return -1; } return r * (r + 1) / 2 + c; };
var raPegMoves = function(p) {
    // every legal jump: [from, over, to]
    var out = [];
    var dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
    for (var i = 0; i < 15; i++) {
        if (!p[i]) { continue; }
        var r = RA_PEG_RC[i][0]; var c = RA_PEG_RC[i][1];
        for (var d = 0; d < 6; d++) {
            var o = raPegIdx(r + dirs[d][0], c + dirs[d][1]); var t = raPegIdx(r + 2 * dirs[d][0], c + 2 * dirs[d][1]);
            if (o >= 0 && t >= 0 && p[o] && !p[t]) { out.push([i, o, t]); }
        }
    }
    return out;
};
var raPegMemo = {};
var raPegWin = function(p) {
    var key = p.join("");
    if (raPegMemo[key] !== undefined) { return raPegMemo[key]; }
    var n = 0; for (var i = 0; i < 15; i++) { n += p[i]; }
    if (n === 1) { raPegMemo[key] = 1; return 1; }
    var mv = raPegMoves(p);
    for (var m = 0; m < mv.length; m++) {
        p[mv[m][0]] = 0; p[mv[m][1]] = 0; p[mv[m][2]] = 1;
        var w = raPegWin(p);
        p[mv[m][0]] = 1; p[mv[m][1]] = 1; p[mv[m][2]] = 0;
        if (w) { raPegMemo[key] = 1; return 1; }
    }
    raPegMemo[key] = 0; return 0;
};
var raPegNext = function(p) {
    var mv = raPegMoves(p);
    for (var m = 0; m < mv.length; m++) {
        var q = p.slice(0); q[mv[m][0]] = 0; q[mv[m][1]] = 0; q[mv[m][2]] = 1;
        if (raPegWin(q)) { return mv[m]; }
    }
    return null;
};
var raPegXY = function(i) { var r = RA_PEG_RC[i][0]; var c = RA_PEG_RC[i][1]; return [200 + (c - r / 2) * 56, 110 + r * 52]; };
var drawRaPeg = function() {
    var A = rainZone; var P = A.peg; var i;
    raTitle("R-7  PEG HOP", "click a drop, then an EMPTY puddle 2 away. it jumps over (and splashes) the drop between.");
    fill(200, 220, 255); textSize(9); textAlign(CENTER); text("end with only ONE raindrop left!", 200, 92);
    fill(30, 50, 90); triangle(200, 80, 60, 340, 340, 340);
    for (i = 0; i < 15; i++) {
        var xy = raPegXY(i);
        fill(20, 34, 60); ellipse(xy[0], xy[1] + 4, 40, 18);
        fill(60, 110, 190); ellipse(xy[0], xy[1] + 2, 36, 14);
        if (P.p[i]) {
            if (P.sel === i) { fill(255, 255, 160, 120); ellipse(xy[0], xy[1] - 6, 36, 36); }
            srDrawDropAt(xy[0], xy[1] - 8, 1.1);
        }
    }
    var n = 0; for (i = 0; i < 15; i++) { n += P.p[i]; }
    fill(220, 235, 255); textSize(10); text("drops left: " + n, 340, 380);
    fill(20, 40, 80, 200); rect(150, 362, 100, 20, 5);
    fill(220, 235, 255); textSize(10); text("START OVER", 200, 376);
};
var raPegPressed = function() {
    var A = rainZone; var P = A.peg;
    if (mouseX > 150 && mouseX < 250 && mouseY > 362 && mouseY < 382) { P.p = P.start.slice(0); P.sel = -1; return; }
    for (var i = 0; i < 15; i++) {
        var xy = raPegXY(i);
        if (dist(mouseX, mouseY, xy[0], xy[1] - 4) > 20) { continue; }
        if (P.p[i]) { P.sel = (P.sel === i) ? -1 : i; return; }
        if (P.sel < 0) { return; }
        var mv = raPegMoves(P.p);
        for (var m = 0; m < mv.length; m++) {
            if (mv[m][0] === P.sel && mv[m][2] === i) {
                P.p[mv[m][0]] = 0; P.p[mv[m][1]] = 0; P.p[i] = 1; P.sel = -1;
                var o = raPegXY(mv[m][1]); burst(o[0], o[1] - 8, 150, 200, 255, 10, 2, 0.1);
                var n = 0; for (var k = 0; k < 15; k++) { n += P.p[k]; }
                if (n === 1) { A.solved = 1; flash(170, 220, 255, 100); l9Say("ONE drop left! ( > )", 200, 360); }
                else if (raPegMoves(P.p).length === 0) { shake(4); l9Say("stuck! " + n + " drops left. (click START OVER)", 200, 360); }
                return;
            }
        }
        l9Say("it has to jump over ONE drop, into an empty puddle.", 200, 360);
        return;
    }
};
// ---- R-8: LIGHT THE STORM. put lightning lamps so EVERY square is lit ----
var RA_LX = 67;
var RA_LY = 96;
var RA_LS = 38;
var raLampLit = function(i) {
    var L = rainZone.lamp;
    if (L.blk[i]) { return false; }
    if (L.on[i] === 1) { return true; }
    var r = floor(i / 7); var c = i % 7;
    var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (var d = 0; d < 4; d++) {
        var rr = r + dirs[d][0]; var cc = c + dirs[d][1];
        while (rr >= 0 && rr < 7 && cc >= 0 && cc < 7 && !L.blk[rr * 7 + cc]) {
            if (L.on[rr * 7 + cc] === 1) { return true; }
            rr += dirs[d][0]; cc += dirs[d][1];
        }
    }
    return false;
};
var drawRaLamp = function() {
    var A = rainZone; var L = A.lamp; var i;
    raTitle("R-8  LIGHT THE STORM", "light EVERY square. lamps shine in straight lines until a cloud blocks them.");
    fill(200, 220, 255); textSize(8); textAlign(CENTER); text("2 lamps can't shine on each other. a number = exactly that many lamps touch that cloud.  click: lamp > dot > empty", 200, 90);
    for (i = 0; i < 49; i++) {
        var x = RA_LX + (i % 7) * RA_LS; var y = RA_LY + floor(i / 7) * RA_LS;
        if (L.blk[i]) {
            fill(50, 56, 76); rect(x + 1, y + 1, RA_LS - 2, RA_LS - 2, 4);
            fill(80, 88, 112); ellipse(x + 13, y + 18, 18, 14); ellipse(x + 24, y + 15, 20, 16); ellipse(x + 19, y + 24, 28, 12);
            if (L.num[i] >= 0) { fill(255, 240, 160); textSize(16); text("" + L.num[i], x + RA_LS / 2, y + RA_LS / 2 + 6); }
        } else {
            var lit = raLampLit(i);
            fill(lit ? 255 : 30, lit ? 240 : 44, lit ? 150 : 70); rect(x + 1, y + 1, RA_LS - 2, RA_LS - 2, 3);
            if (L.on[i] === 1) {
                fill(255, 255, 220); ellipse(x + RA_LS / 2, y + RA_LS / 2 - 2, 18, 18);
                fill(180, 180, 190); rect(x + RA_LS / 2 - 5, y + RA_LS / 2 + 6, 10, 6, 2);
                stroke(255, 200, 40); strokeWeight(2); line(x + 17, y + 12, x + 21, y + 19); line(x + 21, y + 19, x + 18, y + 22); noStroke();
            } else if (L.on[i] === 2) { fill(120, 120, 140); ellipse(x + RA_LS / 2, y + RA_LS / 2, 5, 5); }
        }
    }
};
var raLampPressed = function() {
    var A = rainZone; var L = A.lamp;
    var c = floor((mouseX - RA_LX) / RA_LS); var r = floor((mouseY - RA_LY) / RA_LS);
    if (c < 0 || r < 0 || c > 6 || r > 6) { return; }
    var i = r * 7 + c;
    if (L.blk[i]) { return; }
    L.on[i] = (L.on[i] + 1) % 3;
    for (var k = 0; k < 49; k++) { if (!L.blk[k] && (L.on[k] === 1 ? 1 : 0) !== L.sol[k]) { return; } }
    A.solved = 1; flash(255, 250, 200, 120); l9Say("the whole storm is LIT! ( > )", 200, 360);
};
// ---- R-9: CLOUD PAIRS. split the grid into pairs. every pair of numbers is used exactly ONCE ----
var RA_DX = 60;
var RA_DY = 120;
var RA_DS = 56;
var raDomKey = function(a, b) { return min(a, b) * 10 + max(a, b); };
var drawRaDom = function() {
    var A = rainZone; var D = A.dom; var i;
    raTitle("R-9  CLOUD PAIRS", "click between 2 squares to join them into a pair. every square must be in a pair.");
    fill(200, 220, 255); textSize(8); textAlign(CENTER); text("each pair of numbers (0-0, 0-1 ... 3-3) must be used EXACTLY once.", 200, 92);
    for (i = 0; i < 20; i++) {
        var x = RA_DX + (i % 5) * RA_DS; var y = RA_DY + floor(i / 5) * RA_DS;
        fill(40, 60, 100); rect(x + 3, y + 3, RA_DS - 6, RA_DS - 6, 6);
        fill(220, 235, 255); textSize(22); text("" + D.g[i], x + RA_DS / 2, y + RA_DS / 2 + 8);
    }
    // the pairs you made
    var used = {};
    for (i = 0; i < D.pairs.length; i += 2) {
        var a = D.pairs[i]; var b = D.pairs[i + 1];
        var k = raDomKey(D.g[a], D.g[b]);
        used[k] = (used[k] || 0) + 1;
    }
    for (i = 0; i < D.pairs.length; i += 2) {
        var p = D.pairs[i]; var q = D.pairs[i + 1];
        var dup = used[raDomKey(D.g[p], D.g[q])] > 1;
        var x1 = RA_DX + (min(p, q) % 5) * RA_DS; var y1 = RA_DY + floor(min(p, q) / 5) * RA_DS;
        var w = abs(p - q) === 1 ? RA_DS * 2 : RA_DS; var h = abs(p - q) === 1 ? RA_DS : RA_DS * 2;
        noFill(); stroke(dup ? 255 : 150, dup ? 120 : 220, dup ? 120 : 255); strokeWeight(4); rect(x1 + 5, y1 + 5, w - 10, h - 10, 12); noStroke();
    }
    // checklist of the 10 pairs
    textSize(9);
    for (var a2 = 0; a2 < 4; a2++) {
        for (var b2 = a2; b2 < 4; b2++) {
            var kk = a2 * 10 + b2; var idx = a2 * 4 - a2 * (a2 - 1) / 2 + (b2 - a2);
            var cx = 60 + (idx % 5) * 58; var cy = 352 + floor(idx / 5) * 16;
            fill(used[kk] === 1 ? 140 : (used[kk] > 1 ? 255 : 160), used[kk] === 1 ? 255 : (used[kk] > 1 ? 120 : 180), used[kk] === 1 ? 140 : (used[kk] > 1 ? 120 : 210));
            text(a2 + "-" + b2 + (used[kk] === 1 ? " ok" : ""), cx + 20, cy);
        }
    }
};
var raDomPressed = function() {
    var A = rainZone; var D = A.dom;
    var fx = (mouseX - RA_DX) / RA_DS; var fy = (mouseY - RA_DY) / RA_DS;
    if (fx < 0 || fy < 0 || fx >= 5 || fy >= 4) { return; }
    var c = floor(fx); var r = floor(fy);
    var ox = fx - c; var oy = fy - r;
    // which edge is closest?
    var cand = [];
    if (ox > 0.6 && c < 4) { cand = [r * 5 + c, r * 5 + c + 1]; }
    else if (ox < 0.4 && c > 0) { cand = [r * 5 + c - 1, r * 5 + c]; }
    else if (oy > 0.6 && r < 3) { cand = [r * 5 + c, (r + 1) * 5 + c]; }
    else if (oy < 0.4 && r > 0) { cand = [(r - 1) * 5 + c, r * 5 + c]; }
    if (cand.length === 0) { l9Say("click on the LINE between two squares.", 200, 360); return; }
    // already a pair? remove it
    for (var i = 0; i < D.pairs.length; i += 2) {
        if (D.pairs[i] === cand[0] && D.pairs[i + 1] === cand[1]) { D.pairs.splice(i, 2); return; }
    }
    // remove any pair using these squares
    for (var j = D.pairs.length - 2; j >= 0; j -= 2) {
        if (D.pairs[j] === cand[0] || D.pairs[j] === cand[1] || D.pairs[j + 1] === cand[0] || D.pairs[j + 1] === cand[1]) { D.pairs.splice(j, 2); }
    }
    D.pairs.push(cand[0]); D.pairs.push(cand[1]);
    if (D.pairs.length === 20) {
        var seen = {}; var ok = true;
        for (var k = 0; k < 20; k += 2) { var key = raDomKey(D.g[D.pairs[k]], D.g[D.pairs[k + 1]]); if (seen[key]) { ok = false; } seen[key] = 1; }
        if (ok) { A.solved = 1; flash(170, 220, 255, 100); l9Say("every pair used exactly once! ( > )", 200, 360); }
    }
};
var raSetupMore2 = function(room) {
    var A = rainZone; var i;
    if (room === 6) {
        var p = []; for (i = 0; i < 15; i++) { p.push(1); }
        p[floor(random(0, 15))] = 0;
        A.peg = {p: p, start: p.slice(0), sel: -1};
    } else if (room === 7) {
        var Q = RA_AKARI[floor(random(0, RA_AKARI.length))];
        A.lamp = {blk: [], num: [], on: [], sol: []};
        for (i = 0; i < 49; i++) { A.lamp.blk.push(Q[0].indexOf(i) >= 0 ? 1 : 0); A.lamp.num.push(-1); A.lamp.on.push(0); A.lamp.sol.push(Q[2].indexOf(i) >= 0 ? 1 : 0); }
        for (i = 0; i < Q[1].length; i += 2) { A.lamp.num[Q[1][i]] = Q[1][i + 1]; }
    } else if (room === 8) {
        var D = RA_DOMINO[floor(random(0, RA_DOMINO.length))];
        A.dom = {g: D[0], sol: D[1], pairs: []};
    }
};
var raSetupMore = function(room) {
    var A = rainZone; var i;
    if (room === 3) {
        var P = RA_BRIDGES[floor(random(0, RA_BRIDGES.length))];
        A.br = {isl: P[0], num: P[1], edges: P[2], sol: P[3], val: []};
        for (i = 0; i < P[3].length; i++) { A.br.val.push(0); }
    } else if (room === 4) {
        var M = RA_MINES[floor(random(0, RA_MINES.length))];
        A.sw = {mine: [], start: M[1], mode: 0, zap: 0};
        for (i = 0; i < 64; i++) { A.sw.mine.push(M[0].indexOf(i) >= 0 ? 1 : 0); }
        raSweepStart();
    } else if (room >= 6) {
        raSetupMore2(room);
    } else if (room === 5) {
        var g = [];
        for (i = 0; i < 100; i++) { g.push(floor(random(0, 5))); }
        A.fl = {g: g, start: g.slice(0), moves: 0, limit: raFloodSolve(g).length};
    }
};

var raSetup = function(room) {
    var A = rainZone;
    A.room = room; A.solved = 0;
    if (room === 0) { raMakeHop(); }
    else if (room === 1) { raMakeSort(); }
    else if (room === 2) { raMakeUmb(); }
    else { raSetupMore(room); }
    A.made = room;
};
// phase 8: the storm fish popped, and a door appeared. phase 9: inside the rain area
var drawRainAreaPhase = function() {
    var A = rainZone;
    if (rainEnd.phase === 8) {
        rnStage();
        for (var i = 8; i >= 0; i--) { var h = rnHome(i); rnDrawCast(i, h[0], h[1], 1); }
        var k = min(1, rainEnd.t / 60);
        // the RAIN DOOR in the back wall
        fill(120, 180, 255, 50 + sin(frameCount * 4) * 30); ellipse(200, 130, 160 * k + 10, 180 * k + 10);
        fill(30, 50, 90); rect(160, 70, 80, 130 * k, 6);
        fill(70, 120, 200); rect(166, 76, 68, 124 * k - 6, 4);
        stroke(160, 210, 255); strokeWeight(1.2);
        for (var r = 0; r < 8; r++) { var rx = 170 + (r * 23) % 60; var ry = 80 + (r * 41 + frameCount * 4) % max(1, 116 * k); line(rx, ry, rx - 2, ry + 8); }
        noStroke();
        if (k >= 1) {
            drawRainGem(200, 60, 1.4);
            fill(220, 235, 255); textSize(18); textAlign(CENTER); text("THE RAIN AREA", 200, 236);
            fill(200, 220, 255, 150 + sin(frameCount * 6) * 90); textSize(10); text("(the storm fish popped and everyone is free! click the door)", 200, 252);
        }
        if (rainEnd.t === 1) { l9Say("he POPPED! ...and a door appeared!", 200, 340); }
        return;
    }
    if (A.made !== A.room) { raSetup(A.room); }
    raBg();
    if (A.room === 0) { drawRaHop(); }
    else if (A.room === 1) { drawRaSort(); }
    else if (A.room === 2) { drawRaUmb(); }
    else if (A.room === 3) { drawRaBridges(); }
    else if (A.room === 4) { drawRaSweep(); }
    else if (A.room === 5) { drawRaFlood(); }
    else if (A.room === 6) { drawRaPeg(); }
    else if (A.room === 7) { drawRaLamp(); }
    else { drawRaDom(); }
    if (A.solved) {
        fill(255, 255, 200, 160 + sin(frameCount * 6) * 80); textSize(28); textAlign(CENTER); text(">", 384, 210);
    }
    fill(200, 220, 255); textSize(8); textAlign(LEFT); text("THE RAIN AREA  " + (A.room + 1) + " / 9", 8, 396);
};
var rainAreaPressed = function() {
    var A = rainZone;
    if (rainEnd.phase === 8) {
        if (rainEnd.t > 60 && mouseX > 150 && mouseX < 250 && mouseY > 60 && mouseY < 210) {
            rainEnd.phase = 9; rainEnd.t = 0; rainZone = {room: 0, solved: 0, made: -1};
            flash(150, 200, 255, 120);
        }
        return;
    }
    if (A.made !== A.room) { raSetup(A.room); }
    if (A.solved && mouseX > 360 && abs(mouseY - 202) < 30) {
        if (A.room < 8) { raSetup(A.room + 1); }
        else {
            // finished the rain area: HERE COMES THE HUGE STORM
            rainEnd.phase = 4; rainEnd.t = 69; rainEnd.afterArea = 1;
        }
        return;
    }
    if (A.solved) { return; }
    if (A.room === 0) { raHopPressed(); }
    else if (A.room === 1) { raSortPressed(); }
    else if (A.room === 2) { raUmbPressed(); }
    else if (A.room === 3) { raBridgePressed(); }
    else if (A.room === 4) { raSweepPressed(); }
    else if (A.room === 5) { raFloodPressed(); }
    else if (A.room === 6) { raPegPressed(); }
    else if (A.room === 7) { raLampPressed(); }
    else { raDomPressed(); }
};
var drawRainEnding = function() {
    if (!rainEnd.on) { rnInit(); }
    rainEnd.t++;
    var i;
    // beating the storm fish now unlocks THE RAIN AREA (the huge storm comes after you finish it)
    if (rainEnd.phase === 4 && rainEnd.t === 70 && !rainEnd.afterArea) {
        rainEnd.phase = 8; rainEnd.t = 0;
        flash(200, 230, 255, 255); shake(14);
        burst(rainEnd.fx, rainEnd.fy, 150, 210, 255, 80, 6, 0);
    }
    if (rainEnd.phase === 8 || rainEnd.phase === 9) { drawRainAreaPhase(); drawL9Says(); return; }
    // ---- 0: the curtain closes... and opens again ----
    if (rainEnd.phase === 0) {
        rnStage();
        rnDrawCast(8, 200, 232, 1);
        for (i = 0; i < 8; i++) { rnDrawCast(i, RN_XS[i], 296, 1); }
        drawStormFish(rainEnd.fx, rainEnd.fy + sin(frameCount * 3) * 5, rainEnd.fs, 1);
        var cl = rainEnd.t < 50 ? rainEnd.t / 50 : (rainEnd.t < 90 ? 1 : max(0, 1 - (rainEnd.t - 90) / 60));
        rnCurtains(cl);
        if (rainEnd.t === 150) { rainEnd.phase = 1; rainEnd.t = 0; l9Say("...why is everyone FLOATING??", 200, 180); }
    }
    // ---- 1: the storm fish drains everyone, then pulls them in (like the Altar Beast and the pot critters) ----
    else if (rainEnd.phase === 1) {
        rnStage();
        rainEnd.fx += (200 - rainEnd.fx) * 0.03; rainEnd.fy += (120 - rainEnd.fy) * 0.03;
        rainEnd.fs = min(1.0, rainEnd.fs + 0.004);
        fill(40, 110, 255, min(70, rainEnd.t)); rect(0, 0, 400, 400);
        var stuck = 0;
        for (i = 8; i >= 0; i--) {
            var h = rnHome(i);
            var P = rainEnd.pos[i];
            if (rainEnd.t < 170) {
                // floating, covered in blue light
                P.x = h[0]; P.y = h[1] - min(rainEnd.t, 90) * 0.75 - sin(rainEnd.t * 3 + i * 40) * 5;
                P.d0 = -1;
            } else {
                // glide straight to a spot under the fish, at a steady speed, and stick there
                var sl = rnSlot(i);
                var dx = sl[0] - P.x; var dy = sl[1] - P.y;
                var d = sqrt(dx * dx + dy * dy);
                if (P.d0 < 0) { P.d0 = max(1, d); }
                if (d > 3) {
                    P.x += dx / d * min(1.8, d); P.y += dy / d * min(1.8, d);
                } else {
                    P.x = sl[0]; P.y = sl[1];
                    if (!P.stuck) { P.stuck = 1; burst(P.x, P.y, 120, 200, 255, 8, 2, 0); }
                }
                P.s = 0.35 + 0.65 * constrain(d / P.d0, 0, 1);
            }
            if (P.stuck) { stuck++; }
            var sc = rainEnd.t < 170 ? 1 : P.s;
            fill(90, 170, 255, 70); ellipse(P.x, P.y - 30 * sc, 64 * sc, 74 * sc);
            stroke(130, 210, 255, 90 + random(0, 130)); strokeWeight(2);
            line(rainEnd.fx, rainEnd.fy, P.x, P.y - 30 * sc);
            noStroke();
            rnDrawCast(i, P.x, P.y, sc);
            fill(80, 160, 255, 50); ellipse(P.x, P.y - 30 * sc, 64 * sc, 74 * sc);
        }
        fill(140, 210, 255, 50); ellipse(rainEnd.fx, rainEnd.fy, 220 * rainEnd.fs, 140 * rainEnd.fs);
        drawStormFish(rainEnd.fx + random(-1, 1), rainEnd.fy, rainEnd.fs, 1);
        // the stuck ones get drawn in front of the fish
        for (i = 0; i < 9; i++) {
            if (rainEnd.pos[i].stuck) {
                fill(120, 190, 255, 70); ellipse(rainEnd.pos[i].x, rainEnd.pos[i].y - 10, 34, 34);
                rnDrawCast(i, rainEnd.pos[i].x, rainEnd.pos[i].y, 0.35);
            }
        }
        if (rainEnd.t === 80) { l9Say("the storm fish is DRAINING THEIR POWER!!", 200, 250); }
        if (rainEnd.t === 170) { l9Say("it's pulling them in!!", 200, 250); }
        if (stuck === 9) {
            rainEnd.wait++;
            if (rainEnd.wait > 40) { rainEnd.phase = 2; rainEnd.t = 0; }
        }
    }
    // ---- 2: they sink into him and MERGE. then he powers up into a boss. ----
    else if (rainEnd.phase === 2) {
        rnStage();
        fill(40, 110, 255, 70); rect(0, 0, 400, 400);
        rainEnd.fx = 200; rainEnd.fy += (130 - rainEnd.fy) * 0.1; rainEnd.face = 1;
        var g = constrain((rainEnd.t - 110) / 80, 0, 1);
        rainEnd.fs = 1.0 + g * 0.7;
        var sh = (rainEnd.t > 100 && rainEnd.t < 190) ? (rainEnd.t - 100) / 12 : 0;
        var ox = random(-sh, sh); var oy = random(-sh, sh);
        fill(140, 210, 255, 40 + g * 60); ellipse(200, rainEnd.fy, 300 * g + 120, 200 * g + 80);
        drawMergedStormFish(200 + ox, rainEnd.fy + oy, rainEnd.fs, 1, rainEnd.merged);
        for (i = 0; i < 9; i++) {
            var k = constrain((rainEnd.t - i * 10) / 26, 0, 1);
            if (k < 1) {
                var sl2 = rnSlot(i); var pp = rnPartPos(i);
                var mx = sl2[0] + (pp[0] - sl2[0]) * k; var my = sl2[1] + (pp[1] - sl2[1]) * k;
                fill(120, 190, 255, 70 * (1 - k)); ellipse(mx, my - 10, 34, 34);
                rnDrawCast(i, mx, my + 10 * (1 - k), 0.35 * (1 - k * 0.7));
            } else if (!rainEnd.merged[i]) {
                rainEnd.merged[i] = 1;
                var mp = rnPartPos(i);
                burst(mp[0], mp[1], 150, 210, 255, 14, 2.5, 0);
                shake(3);
            }
        }
        if (rainEnd.t === 1) { l9Say("they're MERGING with him!!!", 200, 250); }
        if (rainEnd.t === 150) { flash(140, 200, 255, 90); shake(6); }
        if (rainEnd.t === 190) { flash(255, 255, 255, 220); shake(14); burst(200, 140, 120, 200, 255, 60, 5, 0); }
        if (rainEnd.t > 190) {
            textAlign(CENTER);
            fill(0, 0, 0, 150); textSize(34); text("THE STORM FISH", 202, 302);
            fill(255, 230, 60); text("THE STORM FISH", 200, 300);
            fill(200, 230, 255); textSize(12); text("(he merged with the whole cast. now he's a BOSS.)", 200, 322);
        }
        if (rainEnd.t >= 290) { rainEnd.phase = 3; rainEnd.t = 0; l9Say("rip your friends out while he's draining them!!", 200, 360); }
    }
    // ---- 3: the boss fight (200 HP. click him! he uses everyone's attacks. DODGE!) ----
    else if (rainEnd.phase === 3) {
        rnStage();
        var freed = 0;
        for (i = 0; i < 9; i++) { if (rainEnd.bub[i].state === 2) { freed++; } }
        if (!rainEnd.lost) {
            rainEnd.fx = 200 + sin(rainEnd.t * (0.8 + freed * 0.06)) * 85;
            rainEnd.fy = 140 + sin(rainEnd.t * 1.6) * 16;
            rainEnd.face = cos(rainEnd.t * (0.8 + freed * 0.06)) >= 0 ? 1 : -1;
        }
        if (rainEnd.hurt > 0) { rainEnd.hurt--; }
        if (rainEnd.hitCD > 0) { rainEnd.hitCD--; }
        if (rainEnd.flashHit > 0) { rainEnd.flashHit--; }
        // dark storm clouds gathering behind him
        fill(20, 28, 52, 120);
        for (var cl = 0; cl < 6; cl++) { ellipse(40 + cl * 64, 30 + (cl % 2) * 12, 110, 50); }
        // freed friends stand on the stage again
        for (i = 8; i >= 0; i--) {
            var bb = rainEnd.bub[i];
            if (bb.state !== 2) { continue; }
            var hm = rnHome(i);
            bb.fall = min(1, bb.fall + 0.03);
            var fk = bb.fall * bb.fall;
            rnDrawCast(i, bb.x + (hm[0] - bb.x) * fk, bb.y + (hm[1] - bb.y) * fk, 0.4 + 0.6 * bb.fall);
        }
        // the boss
        fill(140, 210, 255, 40); ellipse(rainEnd.fx, rainEnd.fy, 270, 170);
        rainEnd.fs = 1.7;
        var still = [];
        for (i = 0; i < 9; i++) {
            still.push(rainEnd.bub[i].state !== 2 ? 1 : 0);
            var pp0 = rnPartPos(i); rainEnd.bub[i].x = pp0[0]; rainEnd.bub[i].y = pp0[1];
        }
        var bsx = rainEnd.flashHit > 0 ? random(-4, 4) : 0;
        drawMergedStormFish(rainEnd.fx + bsx, rainEnd.fy, 1.7, rainEnd.face, still);
        if (rainEnd.flashHit > 0) { fill(255, 255, 255, rainEnd.flashHit * 22); ellipse(rainEnd.fx, rainEnd.fy, 180, 90); }
        // damage numbers
        for (var dn = rainEnd.dmg.length - 1; dn >= 0; dn--) {
            var D = rainEnd.dmg[dn];
            D.t--; D.y -= 0.8;
            fill(255, 240, 120, D.t * 8); textSize(16); textAlign(CENTER); text("-5", D.x, D.y);
            if (D.t <= 0) { rainEnd.dmg.splice(dn, 1); }
        }
        // ---- pick his next attack: his own storm attacks + every friend still merged into him ----
        if (!rainEnd.lost) {
            rainEnd.atkT++;
            if (rainEnd.atkT >= max(48, 105 - freed * 6)) {
                rainEnd.atkT = 0;
                var opts = ["water", "lightning", "hail", "wave", "cage", "pool"];
                for (i = 0; i < 9; i++) { if (rainEnd.bub[i].state !== 2) { opts.push("f" + i); } }
                var pick = opts[floor(random(0, opts.length))];
                if (pick === rainEnd.lastAtk) { pick = opts[floor(random(0, opts.length))]; }
                rainEnd.lastAtk = pick;
                rnAttack(pick);
            }
        }
        // ---- every hazard on screen ----
        for (var hz = rainEnd.hz.length - 1; hz >= 0; hz--) {
            var Hz = rainEnd.hz[hz];
            if (!Hz) { continue; }
            if (rnHazard(Hz) && rainEnd.hz[hz] === Hz) { rainEnd.hz.splice(hz, 1); }
        }
        // you (a little raindrop where your mouse is)
        if (!rainEnd.lost && (rainEnd.hurt === 0 || frameCount % 8 < 4)) { srDrawDropAt(mouseX, mouseY, 0.7); }
        // his health bar
        fill(0, 0, 0, 170); rect(46, 10, 308, 34, 6);
        fill(60, 20, 30); rect(52, 26, 296, 12, 3);
        var hpw = 296 * max(0, rainEnd.hp) / 1000;
        fill(40, 140, 255); rect(52, 26, hpw, 12, 3);
        fill(150, 220, 255); rect(52, 26, hpw, 4, 3);
        fill(255, 230, 60); textSize(10); textAlign(LEFT); text("THE STORM FISH", 56, 22);
        fill(255); textAlign(RIGHT); text(max(0, rainEnd.hp) + " / 1000", 344, 22);
        // your health
        fill(0, 0, 0, 140); rect(6, 368, 110, 26, 5);
        fill(255); textSize(8); textAlign(LEFT); text("YOU", 12, 384);
        for (i = 0; i < 5; i++) { rnHeart(40 + i * 16, 381, i < rainEnd.php); }
        if (rainEnd.hurt > 30) { fill(255, 0, 40, (rainEnd.hurt - 30) * 4); rect(0, 0, 400, 400); }
        if (rainEnd.lost) {
            fill(20, 60, 140, 200); rect(0, 0, 400, 400);
            rnWater(120 + sin(frameCount * 3) * 6, 60, 130, 230, 160);
            textAlign(CENTER);
            fill(255); textSize(28); text("YOU GOT WASHED AWAY", 200, 180);
            fill(200, 225, 255); textSize(13); text("(click to try again)", 200, 210);
        }
        if (rainEnd.hp <= 0) {
            // he's beaten: EVERYONE bursts out of him at once
            for (i = 0; i < 9; i++) { if (rainEnd.bub[i].state !== 2) { rainEnd.bub[i].state = 2; rainEnd.bub[i].fall = 0; } }
            flash(255, 255, 220, 120); shake(10);
            burst(rainEnd.fx, rainEnd.fy, 255, 240, 160, 50, 4.5, 0.05);
            rainEnd.phase = 4; rainEnd.t = 0; rainEnd.hz = [];
            l9Say("...blub?", rainEnd.fx, rainEnd.fy - 80);
        }
    }
    // ---- 4: he explodes into a STORM ----
    else if (rainEnd.phase === 4) {
        if (rainEnd.t < 70) {
            rnStage();
            for (i = 8; i >= 0; i--) { var hh = rnHome(i); rnDrawCast(i, hh[0], hh[1], 1); }
            var sh2 = rainEnd.t / 8;
            drawStormFish(rainEnd.fx + random(-sh2, sh2), rainEnd.fy + random(-sh2, sh2), 1.7 + rainEnd.t * 0.005, rainEnd.face);
            fill(255, 255, 255, rainEnd.t * 3.4); ellipse(rainEnd.fx, rainEnd.fy, 200 + rainEnd.t * 3, 120 + rainEnd.t * 2);
        } else {
            if (rainEnd.t === 70) {
                flash(255, 255, 255, 255); shake(18);
                burst(rainEnd.fx, rainEnd.fy, 150, 210, 255, 80, 6, 0);
                l9Say(rainEnd.afterArea ? "here comes a HUGE STORM!!!" : "HE EXPLODED INTO A STORM!!!", 200, 180);
            }
            background(18, 26, 46);
            fill(30, 40, 66); ellipse(80, 30, 200, 90); ellipse(220, 20, 240, 90); ellipse(350, 34, 200, 90);
            for (i = 8; i >= 0; i--) { var h3 = rnHome(i); rnDrawCast(i, h3[0], h3[1], 1); }
            rnRain(min(140, (rainEnd.t - 70) * 2), 170);
            rainEnd.water = min(400, (rainEnd.t - 70) * 1.15);
            rnWater(rainEnd.water, 50, 120, 220, 170);
            if (rainEnd.t % 55 === 0) {
                flash(220, 235, 255, 140); shake(5);
            }
            if (rainEnd.t % 55 < 8) { drawLightningBolt(80 + (rainEnd.t * 37) % 240, 0, 60 + (rainEnd.t * 53) % 280, 260, rainEnd.t, 255); }
            if (rainEnd.t === 200) { l9Say("it's raining SO much...", 200, 120); }
            if (rainEnd.t === 330) { l9Say("the screen is FILLING UP!!", 200, 120); }
            if (rainEnd.t >= 440) { rainEnd.phase = 5; rainEnd.t = 0; }
        }
    }
    // ---- 5: the screen is full of water... and it CRACKS ----
    else if (rainEnd.phase === 5) {
        background(40, 110, 210);
        fill(80, 150, 240, 120);
        for (i = 0; i < 14; i++) { ellipse((i * 67) % 400, 400 - (rainEnd.t * 2 + i * 53) % 420, 8 + i % 4 * 3, 8 + i % 4 * 3); }
        var ck = min(1, rainEnd.t / 50);
        stroke(240, 250, 255); strokeWeight(2);
        for (var c = 0; c < rainEnd.cracks.length; c++) {
            var P = rainEnd.cracks[c];
            var segs = floor(ck * (P.length - 1) + 0.999);
            for (var q = 0; q < segs; q++) { line(P[q][0], P[q][1], P[q + 1][0], P[q + 1][1]); }
        }
        noStroke();
        if (rainEnd.t === 1 || rainEnd.t === 25 || rainEnd.t === 50) { shake(8); }
        if (rainEnd.t >= 100) {
            rainEnd.phase = 6; rainEnd.t = 0; rainEnd.water = 0;
            flash(255, 255, 255, 255); shake(10);
        }
    }
    // ---- 7: the REAL R.A.I.N. ending ----
    else if (rainEnd.phase === 7) {
        drawL6Desk();
        // the laptop is fixed and happy
        fill(70, 72, 80); rect(262, 110, 96, 80, 3);
        fill(250, 245, 220); rect(266, 114, 88, 72);
        fill(255, 200, 60); ellipse(310, 140, 26, 26);
        fill(40); ellipse(305, 137, 3, 4); ellipse(315, 137, 3, 4);
        noFill(); stroke(40); strokeWeight(1.5); arc(310, 143, 12, 8, 0, 180); noStroke();
        fill(60, 60, 70); textSize(7); textAlign(CENTER); text("all dry :)", 310, 172);
        // the water drains away
        rainEnd.water = max(0, 400 - rainEnd.t * 2.2);
        if (rainEnd.water > 0) { rnWater(rainEnd.water, 50, 130, 230, 165); }
        // a rainbow!
        var rb = min(1, max(0, (rainEnd.t - 120) / 80));
        var rcs = [[255, 70, 70], [255, 160, 50], [255, 230, 60], [80, 210, 90], [70, 150, 255], [160, 90, 230]];
        noFill(); strokeWeight(9);
        for (var rc = 0; rc < 6; rc++) {
            stroke(rcs[rc][0], rcs[rc][1], rcs[rc][2], 200 * rb);
            arc(200, 300, 420 - rc * 18, 380 - rc * 18, 180, 180 + 180 * rb);
        }
        noStroke(); strokeWeight(1);
        // everyone pops up on the desk to celebrate
        if (rainEnd.t > 200) {
            for (var ci = 0; ci < 9; ci++) {
                var pop = min(1, max(0, (rainEnd.t - 200 - ci * 12) / 20));
                if (pop <= 0) { continue; }
                var hop = abs(sin(frameCount * 6 + ci * 40)) * 8;
                rnDrawCast(ci, 28 + ci * 43, 232 - hop, 0.42 * pop);
            }
        }
        if (rainEnd.t > 200 && rainEnd.t % 20 === 0) {
            burst(random(30, 370), random(40, 160), floor(random(120, 255)), floor(random(120, 255)), floor(random(120, 255)), 18, 3.5, 0.06);
        }
        textAlign(CENTER);
        if (rainEnd.t > 260) {
            var ta = min(255, (rainEnd.t - 260) * 5);
            fill(30, 30, 0, ta * 0.6); textSize(26); text("THE REAL R.A.I.N. ENDING", 202, 52);
            fill(255, 225, 40, ta); text("THE REAL R.A.I.N. ENDING", 200, 50);
            fill(255, 255, 255, ta); textSize(15); text("Radiant. Amazing. Incredible. Nice.", 200, 76);
        }
        if (rainEnd.t > 380) {
            var tb = min(255, (rainEnd.t - 380) * 5);
            fill(255, 255, 255, tb); textSize(14); text("you did it. everyone is home. the rain stopped.", 200, 330);
            fill(255, 225, 40, tb); textSize(12); text("thanks for playing!   - Toadjames", 200, 352);
        }
    }
    // ---- 6: back at the developer's desk. water everywhere. ----
    else {
        drawL6Desk();
        var mx = 310; var my = 150;
        // the laptop screen has been cracked wide open from the inside
        fill(70, 72, 80); rect(262, 110, 96, 80, 3);
        fill(8, 14, 30); rect(266, 114, 88, 72);
        stroke(220, 235, 255, 200); strokeWeight(1);
        for (var cr = 0; cr < 9; cr++) {
            var ca = cr * 40 + 15;
            line(mx, my, mx + cos(ca) * 44, my + sin(ca) * 36);
            line(mx + cos(ca) * 22, my + sin(ca) * 18, mx + cos(ca + 25) * 34, my + sin(ca + 25) * 28);
        }
        noStroke();
        fill(10, 18, 36);
        beginShape();
        vertex(mx - 26, my - 16); vertex(mx - 8, my - 28); vertex(mx + 6, my - 18); vertex(mx + 24, my - 26);
        vertex(mx + 30, my - 4); vertex(mx + 22, my + 20); vertex(mx + 2, my + 28); vertex(mx - 20, my + 22); vertex(mx - 30, my + 2);
        endShape(CLOSE);
        fill(60, 140, 230, 210); ellipse(mx, my, 40, 34);
        fill(150, 210, 255, 160); ellipse(mx - 6, my - 6, 12, 8);
        // water POURING out of the laptop
        fill(70, 150, 240, 175);
        quad(mx - 14, my + 4, mx + 14, my + 4, mx + 46, 400, mx - 46, 400);
        fill(70, 150, 240, 120);
        quad(mx + 10, my, mx + 22, my, mx + 70, 214, mx + 52, 214);
        stroke(200, 230, 255, 160); strokeWeight(2);
        for (var w = 0; w < 7; w++) {
            var wy = (frameCount * 9 + w * 60) % 400;
            if (wy > my) { var ww = 14 + (wy - my) * 0.13; line(mx - ww + w * 5, wy, mx - ww + w * 5 + 2, wy + 22); }
        }
        noStroke();
        if (frameCount % 2 === 0) { burst(mx + random(-14, 14), my + 6, 150, 210, 255, 2, 3, 0.15); }
        if (frameCount % 5 === 0) { burst(mx + random(-30, 30), 214, 150, 210, 255, 3, 2, 0.15); }
        rainEnd.water = min(400, rainEnd.water + 0.9);
        rnWater(rainEnd.water, 50, 130, 230, 165);
        fill(200, 230, 255, 120);
        for (i = 0; i < 10; i++) {
            var by = 400 - (frameCount * 1.5 + i * 47) % max(1, rainEnd.water);
            ellipse(30 + i * 38 + sin(frameCount * 3 + i * 40) * 6, by, 5, 5);
        }
        if (rainEnd.water >= 400) {
            if (rainEnd.full < 0) { rainEnd.full = rainEnd.t; }
            var tt = rainEnd.t - rainEnd.full;
            if (tt > 500) { rainEnd.puzzle = 1; }
            // sticky notes float up out of the desk... with scrambled words on them
            if (rainEnd.puzzle) {
                var np = [[54, 182], [346, 206], [54, 262], [346, 286]];
                for (var nt = 0; nt < 4; nt++) {
                    var rise = min(1, (tt - 500) / 90);
                    var nx = np[nt][0] + sin(frameCount * 2 + nt * 80) * 4;
                    var ny = np[nt][1] + 120 * (1 - rise) + cos(frameCount * 3 + nt * 50) * 3;
                    noStroke();
                    fill(0, 0, 0, 40); rect(nx - 33, ny - 15, 68, 34, 2);
                    fill(250, 236, 120); rect(nx - 35, ny - 17, 68, 34, 2);
                    fill(235, 215, 90); rect(nx - 35, ny - 17, 68, 6);
                    fill(80, 60, 20); textSize(nt === 2 ? 10 : 12); textAlign(CENTER); text(RN_NOTES[nt], nx - 1, ny + 6);
                }
            }
            textAlign(CENTER);
            for (var ln = 0; ln < RN_TEXT.length; ln++) {
                if (tt < 30 + ln * 55) { continue; }
                var la = min(255, (tt - 30 - ln * 55) * 6);
                var ly = 70 + ln * 36 + sin(frameCount * 3 + ln * 30) * 2;
                var sz = ln === 0 ? 34 : (ln >= 3 && ln <= 6 ? 22 : 17);
                var word = RN_TEXT[ln];
                if (ln >= 3 && ln <= 6) {
                    word = RN_WORDS[ln - 3][rainEnd.words[ln - 3]];
                    if (rainEnd.puzzle && abs(mouseY - ly + 7) < 14 && abs(mouseX - 200) < 90) {
                        fill(255, 255, 255, 40); rect(110, ly - 22, 180, 30, 6);
                    }
                }
                textSize(sz);
                fill(30, 30, 0, la * 0.6); text(word, 202, ly + 2);
                fill(255, 225, 40, la); text(word, 200, ly);
            }
        }
    }
    drawL9Says();
};
var rnPressed = function() {
    if (rainEnd.phase === 8 || rainEnd.phase === 9) { rainAreaPressed(); return; }
    if (rainEnd.phase === 6 && rainEnd.puzzle) {
        for (var w = 0; w < 4; w++) {
            var ly = 70 + (w + 3) * 36;
            if (abs(mouseY - ly + 7) < 15 && abs(mouseX - 200) < 95) {
                rainEnd.words[w] = (rainEnd.words[w] + 1) % 4;
                burst(200, ly - 6, 255, 225, 40, 6, 2, 0);
                if (rainEnd.words[0] === RN_GOAL[0] && rainEnd.words[1] === RN_GOAL[1] && rainEnd.words[2] === RN_GOAL[2] && rainEnd.words[3] === RN_GOAL[3]) {
                    rainEnd.phase = 7; rainEnd.t = 0;
                    flash(255, 250, 220, 200); shake(6);
                }
                return;
            }
        }
        return;
    }
    if (rainEnd.phase !== 3) { return; }
    if (rainEnd.lost) { rnResetFight(); return; }
    if (rainEnd.hitCD > 0) { return; }
    var ex = (mouseX - rainEnd.fx) / 95; var ey = (mouseY - rainEnd.fy) / 52;
    if (ex * ex + ey * ey > 1) { return; }
    rainEnd.hp -= 5; rainEnd.hits++;
    rainEnd.hitCD = 6; rainEnd.flashHit = 6;
    rainEnd.dmg.push({x: mouseX + random(-8, 8), y: mouseY - 14, t: 30});
    burst(mouseX, mouseY, 170, 225, 255, 6, 2.5, 0.05);
    shake(1.5);
};


// ============ THE TRES ENDING: Tres eats the whole cast, evolves AGAIN, and it's a fight ============
var TS_EAT_ORDER = [5, 3, 2, 4, 0, 1, 7, 6, 8];
var TS_GULPS = ["GULP!", "CHOMP!", "*crunch*", "SLURP!", "*munch munch*", "GULP!", "NOM!", "*CHOMP*", "...BURP."];
var tresEnd = {on: 0};
var tsInit = function() {
    tresEnd = {on: 1, phase: 0, t: 0, x: l9Tres.sx, y: l9Tres.sy, s: 0.5, eaten: [0, 0, 0, 0, 0, 0, 0, 0, 0], eatI: 0, eatT: 0,
        hp: 1000, php: 5, hurt: 0, lost: 0, hz: [], atkT: 0, last: "", hitCD: 0, flashHit: 0, dmg: [], wait: 0,
        floor: [], carry: -1, mouthT: 0, taunt: 0, line: 0, lineT: 0};
};
var tsMouth = function() { return [tresEnd.x, tresEnd.y + 8 * tresEnd.s]; };
var tsHurt = function() {
    if (tresEnd.hurt > 0 || tresEnd.lost) { return; }
    tresEnd.php--;
    tresEnd.hurt = 55;
    shake(8); flash(255, 200, 40, 90);
    burst(mouseX, mouseY, 255, 210, 80, 16, 3, 0.1);
    if (tresEnd.carry >= 0) { tresEnd.carry = -1; l9Say("you dropped the coin!", 200, 340); }
    if (tresEnd.php <= 0) { tresEnd.lost = 1; tresEnd.hz = []; }
    else {
        var ow = ["OUCH!", "CLINK! (-1 heart)", "BONK! (-1 heart)", "that's gonna leave a mark (-1 heart)"];
        l9Say(ow[floor(random(0, ow.length))], 200, 360);
    }
};
// the cast he ate, swirling around in his see-through belly
var tsDrawBelly = function(x, y, s) {
    var bx = x; var by = y + 46 * s;
    var n = 0;
    for (var i = 0; i < 9; i++) {
        if (!tresEnd.eaten[i]) { continue; }
        var a = frameCount * 2 + i * 40;
        rnDrawCast(i, bx + cos(a) * 22 * s, by + 14 * s + sin(a) * 10 * s, 0.2 * s);
        n++;
    }
    noStroke();
    fill(255, 210, 90, 70); ellipse(bx, by, 74 * s, 56 * s);
    fill(255, 255, 230, 120); ellipse(bx - 18 * s, by - 14 * s, 14 * s, 8 * s);
    noFill(); stroke(200, 150, 40); strokeWeight(3 * s); ellipse(bx, by, 76 * s, 58 * s); noStroke();
};
// ---- Mega Tres's attacks (all treasure) ----
var TS_ATKS = ["coins", "shards", "pearls", "jewels", "grab", "flood"];
var TS_GIGA_ATKS = ["coins", "shards", "pearls", "jewels", "grab", "flood", "bars", "tornado"];
var TS_SPEECH = ["YOU FOOL!", "by hitting me, you have just brought the LAST EVOLVE POINT!",
    "you thought that was my HEALTH... and you were making it go down...", "but where the yellow was... was EMPTY!",
    "THOSE WERE MY EVOLVE POINTS!!!"];
var TS_GIGA_TAUNTS = ["HAHA! hitting me does NOTHING now!", "i'm made of REAL treasure. nothing REAL can hurt me!",
    "...only something FAKE could ever hurt me. (not that i'd tell you)", "*AAAH* i eat anything that falls in my mouth. ...wait. forget i said that."];
var GIGA_HP = 800;
var TS_ATK_NAMES = {coins: "COIN SHOWER!", shards: "GEM SHARDS!", chest: "TREASURE TRAP!", pearls: "PEARL NECKLACE!",
    jewels: "BOUNCY JEWELS!", grab: "GREEDY GRAB!", flood: "GOLD FLOOD!", bars: "GOLD BAR STAMPEDE!", tornado: "TREASURE TORNADO!"};
var tsAttack = function(pick) {
    var mx = constrain(mouseX, 20, 380); var my = constrain(mouseY, 60, 380);
    var k;
    l9Say(TS_ATK_NAMES[pick], 200, 66);
    if (pick === "coins") {
        for (k = 0; k < 11; k++) {
            var cx = k < 3 ? constrain(mx + random(-30, 30), 14, 386) : random(14, 386);
            var cy = k < 3 ? constrain(my + random(-20, 20), 70, 384) : random(110, 384);
            tresEnd.hz.push({k: "coin", x: cx, ty: cy, t: -k * 4, warn: 36, fake: tresEnd.phase === 5 && k % 4 === 1 ? 1 : 0});
        }
    } else if (pick === "shards") {
        var off = random(0, 36);
        var angs = [];
        for (k = 0; k < 10; k++) { angs.push(off + k * 36); }
        tresEnd.hz.push({k: "shard", x: tresEnd.x, y: tresEnd.y + 20, angs: angs, t: 0, warn: 44, dur: 60});
    } else if (pick === "chest") {
        tresEnd.hz.push({k: "chest", x: mx, y: my, t: 0, warn: 46});
    } else if (pick === "pearls") {
        var side = random(0, 1) < 0.5;
        tresEnd.hz.push({k: "pearl", down: side, gap: side ? random(50, 350) : random(110, 350), t: 0, warn: 42});
    } else if (pick === "jewels") {
        var js = [];
        for (k = 0; k < 3; k++) {
            var ja = random(20, 160);
            js.push({x: tresEnd.x, y: tresEnd.y + 30, vx: cos(ja) * 3.4, vy: sin(ja) * 3.4, c: [[230, 40, 70], [60, 200, 110], [70, 140, 255]][k]});
        }
        tresEnd.hz.push({k: "jewel", js: js, t: 0, warn: 26, dur: 210});
    } else if (pick === "grab") {
        tresEnd.hz.push({k: "grab", x: tresEnd.x + 60, y: tresEnd.y + 60, t: 0, warn: 30, dur: 170});
    } else if (pick === "bars") {
        var safe = floor(random(0, 6));
        var lanes = [];
        for (k = 0; k < 6; k++) { if (k !== safe) { lanes.push(105 + k * 50); } }
        tresEnd.hz.push({k: "bars", lanes: lanes, safe: 105 + safe * 50, dir: random(0, 1) < 0.5 ? 1 : -1, t: 0, warn: 46});
    } else if (pick === "tornado") {
        tresEnd.hz.push({k: "tornado", x: tresEnd.x, t: 0, warn: 36, dur: 220});
    } else {
        tresEnd.hz.push({k: "flood", top: 236, t: 0, warn: 64, dur: 90});
    }
};
// one hazard: draws it + hurts you if it touches you. returns true when it's done
var tsHazard = function(H) {
    H.t++;
    if (H.t < 0) { return false; }
    var k, i;
    if (H.k === "coin") {
        if (H.t < H.warn) {
            var g = H.t / H.warn;
            noStroke(); fill(0, 0, 0, 60 + g * 60); ellipse(H.x, H.ty + 4, 10 + g * 22, 4 + g * 8);
            noFill(); stroke(255, 200, 60, 200); strokeWeight(2); ellipse(H.x, H.ty, 34 - g * 14, 34 - g * 14); noStroke();
            return false;
        }
        var f = H.t - H.warn;
        if (f < 10) { if (H.fake) { drawFoolCoin(H.x, -20 + (H.ty + 20) * f / 10, 22); } else { tresCoin(H.x, -20 + (H.ty + 20) * f / 10, 22); } return false; }
        if (H.fake) { drawFoolCoin(H.x, H.ty, 22); } else { tresCoin(H.x, H.ty, 22); }
        if (f === 10) {
            burst(H.x, H.ty, 255, 210, 80, 6, 2, 0.1);
            if (tresEnd.phase === 5 && tresEnd.floor.length < 14) { tresEnd.floor.push({x: H.x, y: H.ty, fake: H.fake, t: 0}); }
        }
        if (dist(mouseX, mouseY, H.x, H.ty) < 18) { tsHurt(); }
        return f >= 20;
    }
    if (H.k === "shard") {
        if (H.t < H.warn) {
            stroke(255, 120, 150, 50 + H.t * 3); strokeWeight(1.5);
            for (i = 0; i < H.angs.length; i++) { line(H.x, H.y, H.x + cos(H.angs[i]) * 500, H.y + sin(H.angs[i]) * 500); }
            noStroke();
            tresGem(H.x, H.y, 20 + sin(H.t * 20) * 4, 230, 40, 70);
            return false;
        }
        var d = (H.t - H.warn) * 7;
        for (i = 0; i < H.angs.length; i++) {
            var sx = H.x + cos(H.angs[i]) * d; var sy = H.y + sin(H.angs[i]) * d;
            tresGem(sx, sy, 14, i % 2 ? 230 : 70, i % 2 ? 40 : 140, i % 2 ? 70 : 255);
            if (dist(mouseX, mouseY, sx, sy) < 11) { tsHurt(); }
        }
        return H.t - H.warn > H.dur;
    }
    if (H.k === "chest") {
        var shut = H.t < H.warn ? 0 : min(1, (H.t - H.warn) / 6);
        var R = 44;
        noStroke();
        fill(90, 56, 26, 200); rect(H.x - R, H.y, R * 2, R * 0.7, 4);
        fill(200, 160, 60); rect(H.x - R, H.y + 8, R * 2, 5);
        // the lid: wide open, then SLAM
        var lidY = H.y - R * (1 - shut) * 1.2;
        fill(110, 70, 34, 220); rect(H.x - R, lidY - R * 0.5, R * 2, R * 0.5, 6);
        fill(200, 160, 60); rect(H.x - 5, lidY - R * 0.5, 10, R * 0.5);
        fill(250, 235, 180);
        for (i = 0; i < 8; i++) { triangle(H.x - R + 6 + i * 11, lidY, H.x - R + 12 + i * 11, lidY, H.x - R + 9 + i * 11, lidY + 7); }
        if (H.t < H.warn) {
            noFill(); stroke(255, 60, 40, 120 + sin(H.t * 20) * 100); strokeWeight(2); ellipse(H.x, H.y, R * 2, R * 1.6); noStroke();
            return false;
        }
        if (H.t - H.warn === 6) { shake(5); burst(H.x, H.y, 255, 210, 80, 10, 2.5, 0.1); }
        if (H.t - H.warn >= 4 && H.t - H.warn < 12 && abs(mouseX - H.x) < R && abs(mouseY - H.y) < R * 0.8) { tsHurt(); }
        return H.t - H.warn > 22;
    }
    if (H.k === "pearl") {
        var pos = H.t < H.warn ? (H.down ? 60 : 0) : (H.down ? 60 + (H.t - H.warn) * 3.2 : (H.t - H.warn) * 3.6);
        var a = H.t < H.warn ? 80 + H.t * 3 : 255;
        noStroke();
        for (i = 0; i < 40; i++) {
            var q = i * 10 + 5;
            if (abs(q - H.gap) < 38) { continue; }
            fill(250, 248, 235, a); ellipse(H.down ? q : pos, H.down ? pos : q, 9, 9);
            fill(255, 255, 255, a); ellipse((H.down ? q : pos) - 2, (H.down ? pos : q) - 2, 3, 3);
        }
        if (H.t < H.warn) {
            fill(120, 255, 140, 120); textSize(9); textAlign(CENTER);
            if (H.down) { text("GAP", H.gap, 52); } else { text("GAP", 14, H.gap + 3); }
            return false;
        }
        var near = H.down ? abs(mouseY - pos) < 8 : abs(mouseX - pos) < 8;
        var inGap = H.down ? abs(mouseX - H.gap) < 34 : abs(mouseY - H.gap) < 34;
        if (near && !inGap) { tsHurt(); }
        return pos > 410;
    }
    if (H.k === "jewel") {
        for (i = 0; i < H.js.length; i++) {
            var J = H.js[i];
            if (H.t >= H.warn) {
                J.x += J.vx; J.y += J.vy;
                if (J.x < 10 || J.x > 390) { J.vx = -J.vx; J.x = constrain(J.x, 10, 390); }
                if (J.y < 50 || J.y > 390) { J.vy = -J.vy; J.y = constrain(J.y, 50, 390); }
                if (dist(mouseX, mouseY, J.x, J.y) < 13) { tsHurt(); }
            }
            noStroke(); fill(J.c[0], J.c[1], J.c[2], 60); ellipse(J.x, J.y, 30, 30);
            tresGem(J.x, J.y, 18, J.c[0], J.c[1], J.c[2]);
        }
        return H.t > H.dur;
    }
    if (H.k === "grab") {
        if (H.t >= H.warn) {
            var dx = mouseX - H.x; var dy = mouseY - H.y; var dd = max(1, sqrt(dx * dx + dy * dy));
            var sp = H.t - H.warn > 90 ? 2.3 : 1.8;
            H.x += dx / dd * min(sp, dd); H.y += dy / dd * min(sp, dd);
            if (dd < 20) { tsHurt(); }
        }
        // the chain back to Tres
        stroke(220, 170, 50); strokeWeight(3); line(tresEnd.x, tresEnd.y + 20, H.x, H.y); noStroke();
        for (i = 1; i < 8; i++) {
            fill(240, 200, 70); ellipse(tresEnd.x + (H.x - tresEnd.x) * i / 8, tresEnd.y + 20 + (H.y - tresEnd.y - 20) * i / 8, 7, 5);
        }
        // a big golden hand
        var op = sin(H.t * 10) * 3;
        fill(200, 140, 30); ellipse(H.x, H.y, 32, 28);
        fill(245, 195, 65); ellipse(H.x, H.y - 2, 28, 24);
        for (i = 0; i < 4; i++) { ellipse(H.x - 12 + i * 8, H.y - 16 - op - abs(i - 1.5) * -2, 8, 16); }
        ellipse(H.x + 16, H.y + 2, 14, 8);
        tresGem(H.x - 4, H.y - 12 - op, 7, 230, 40, 70);
        if (H.t < H.warn) { noFill(); stroke(255, 60, 40, 200); strokeWeight(2); ellipse(H.x, H.y, 44, 44); noStroke(); }
        return H.t > H.dur;
    }
    if (H.k === "bars") {
        var bx = H.t < H.warn ? -999 : (H.dir > 0 ? -60 + (H.t - H.warn) * 8 : 460 - (H.t - H.warn) * 8);
        noStroke();
        if (H.t < H.warn) {
            for (i = 0; i < H.lanes.length; i++) {
                fill(255, 200, 60, 40 + sin(H.t * 20) * 30); rect(0, H.lanes[i] - 18, 400, 36);
                fill(255, 220, 90); textSize(16); textAlign(CENTER); text(H.dir > 0 ? ">>>" : "<<<", H.dir > 0 ? 24 : 376, H.lanes[i] + 6);
            }
            fill(120, 255, 140, 60); rect(0, H.safe - 18, 400, 36);
            fill(150, 255, 160); textSize(10); text("SAFE", 200, H.safe + 4);
            return false;
        }
        for (i = 0; i < H.lanes.length; i++) {
            var ly = H.lanes[i]; var lx = bx + (i % 2) * 30 * H.dir * -1;
            fill(160, 105, 20); rect(lx - 32, ly - 14, 64, 30, 3);
            fill(245, 195, 60); rect(lx - 30, ly - 16, 60, 26, 3);
            fill(255, 235, 150); rect(lx - 26, ly - 14, 52, 5, 2);
            fill(170, 115, 20); textSize(7); textAlign(CENTER); text("999", lx, ly + 3);
            if (abs(mouseY - ly) < 17 && abs(mouseX - lx) < 32) { tsHurt(); }
        }
        return bx > 520 || bx < -120;
    }
    if (H.k === "tornado") {
        if (H.t >= H.warn) {
            var tsp = H.t - H.warn > 120 ? 2.2 : 1.5;
            if (abs(mouseX - H.x) > 1) { H.x += (mouseX > H.x ? 1 : -1) * min(tsp, abs(mouseX - H.x)); }
            if (abs(mouseX - H.x) < 20 && mouseY > 196) { tsHurt(); }
        }
        noStroke();
        var ta2 = H.t < H.warn ? 60 : 200;
        fill(255, 210, 80, ta2 * 0.3); rect(H.x - 22, 196, 44, 204);
        if (H.t < H.warn) { fill(255, 220, 90); textSize(10); textAlign(CENTER); text("(jump OVER it!)", H.x, 188); }
        for (i = 0; i < 10; i++) {
            var ty = 206 + i * 20;
            var tw = 14 + i * 1.6;
            var spin = frameCount * 14 + i * 40;
            if (H.t < H.warn) { fill(255, 220, 90, 90); ellipse(H.x, ty, tw * 2, 6); }
            else { tresCoin(H.x + cos(spin) * tw, ty + sin(spin) * 3, 11); tresCoin(H.x - cos(spin) * tw, ty - sin(spin) * 3, 9); }
        }
        return H.t > H.dur;
    }
    if (H.k === "flood") {
        if (H.t < H.warn) {
            stroke(255, 200, 60, 120 + sin(H.t * 20) * 100); strokeWeight(2);
            for (var dl = 0; dl < 400; dl += 20) { line(dl, H.top, dl + 10, H.top); }
            noStroke();
            fill(255, 220, 90); textSize(12); textAlign(CENTER); text("GET UP HIGH!!", 200, H.top - 8);
            return false;
        }
        var f2 = H.t - H.warn;
        var lvl = f2 < 16 ? 400 - (400 - H.top) * f2 / 16 : (f2 > H.dur - 16 ? H.top + (400 - H.top) * (f2 - H.dur + 16) / 16 : H.top);
        noStroke();
        fill(230, 170, 30, 220);
        beginShape(); vertex(0, 400);
        for (var x = 0; x <= 400; x += 20) { vertex(x, lvl + sin(frameCount * 6 + x * 4) * 4); }
        vertex(400, 400); endShape(CLOSE);
        fill(255, 230, 120, 200);
        for (var x2 = 0; x2 < 400; x2 += 30) { ellipse(x2 + 10, lvl + 8 + sin(frameCount * 6 + x2 * 4) * 4, 14, 4); }
        if (mouseY > lvl + 4) { tsHurt(); }
        return f2 > H.dur;
    }
    return true;
};
var tsResetFight = function() {
    tresEnd.php = 5; tresEnd.hurt = 0; tresEnd.lost = 0;
    tresEnd.hp = 1000; tresEnd.t = 0; tresEnd.atkT = 0; tresEnd.last = "";
    tresEnd.hz = []; tresEnd.dmg = [];
    l9Say("ROUND 2. (Mega Tres is back to full health)", 200, 360);
};
var tsTongue = function(x1, y1, x2, y2) {
    stroke(200, 140, 30); strokeWeight(5); line(x1, y1, x2, y2);
    stroke(250, 205, 70); strokeWeight(2.5); line(x1, y1, x2, y2);
    noStroke();
    for (var i = 1; i < 10; i++) { fill(255, 230, 120); ellipse(x1 + (x2 - x1) * i / 10, y1 + (y2 - y1) * i / 10, 5, 4); }
    tresCoin(x2, y2, 16);
};
// ============ THE GOLD AREA (unlocked when you beat Giga-Tres) ============
var GA_RUSH = [[[[1,  2,  2],  [1,  4,  3],  [1,  5,  2],  [0,  2,  2],  [0,  3,  2],  [0,  5,  2],  [0,  5,  2],  [1,  0,  2],  [0,  0,  2],  [1,  5,  2],  [0,  3,  2]],  [0,  0,  4,  1,  0,  3,  0,  1,  0,  1,  2]],  [[[1,  2,  2],  [0,  1,  2],  [0,  2,  3],  [0,  4,  2],  [0,  5,  2],  [1,  5,  2],  [0,  0,  3],  [0,  3,  2],  [0,  0,  2],  [1,  1,  2],  [1,  4,  2],  [1,  0,  2],  [0,  3,  2]],  [0,  4,  1,  3,  4,  2,  3,  0,  0,  4,  2,  1,  2]],  [[[1,  2,  2],  [0,  3,  2],  [0,  3,  2],  [0,  0,  2],  [1,  5,  3],  [1,  1,  2],  [1,  0,  3],  [1,  4,  2],  [1,  3,  2],  [0,  2,  2],  [1,  4,  2],  [1,  3,  2],  [1,  5,  2]],  [0,  0,  3,  3,  0,  4,  0,  4,  1,  1,  1,  4,  3]],  [[[1,  2,  2],  [0,  4,  2],  [1,  4,  2],  [0,  0,  2],  [1,  1,  2],  [1,  5,  3],  [0,  2,  3],  [0,  5,  2],  [0,  3,  2],  [0,  3,  2],  [1,  0,  3],  [0,  5,  2]],  [0,  2,  0,  0,  4,  2,  1,  4,  1,  3,  1,  2]],  [[[1,  2,  2],  [0,  2,  3],  [1,  4,  2],  [1,  5,  2],  [0,  3,  3],  [1,  0,  2],  [1,  3,  2],  [1,  0,  2],  [1,  5,  2],  [0,  4,  2],  [0,  0,  2],  [0,  1,  2],  [1,  1,  2]],  [0,  0,  3,  4,  1,  4,  1,  0,  2,  2,  4,  4,  4]],  [[[1,  2,  2],  [1,  5,  2],  [0,  2,  3],  [1,  3,  2],  [0,  3,  2],  [0,  5,  2],  [0,  5,  2],  [1,  0,  2],  [0,  1,  2],  [0,  3,  2],  [0,  0,  2]],  [0,  3,  2,  0,  0,  3,  1,  4,  0,  3,  4]]];
var GA_NIM_START = [[3, 5, 7], [2, 5, 6], [1, 4, 6], [3, 4, 6], [2, 6, 7], [4, 5, 7]];
var GA_MAGIC = [[2, 7, 6, 9, 5, 1, 4, 3, 8], [2, 9, 4, 7, 5, 3, 6, 1, 8], [4, 3, 8, 9, 5, 1, 2, 7, 6], [4, 9, 2, 3, 5, 7, 8, 1, 6],
    [6, 1, 8, 7, 5, 3, 2, 9, 4], [6, 7, 2, 1, 5, 9, 8, 3, 4], [8, 1, 6, 3, 5, 7, 4, 9, 2], [8, 3, 4, 1, 5, 9, 6, 7, 2]];
var goldArea = {room: 0, solved: 0, made: -1};
var gaBg = function() {
    noStroke();
    background(50, 34, 12);
    for (var r = 0; r < 14; r++) {
        for (var c = 0; c < 9; c++) {
            fill(84 + (r * 7 + c * 13) % 18, 60 + (r * 5 + c * 11) % 12, 20 + (r * 3) % 8);
            rect(c * 48 + (r % 2) * 24 - 24 + 1, r * 30 + 1, 46, 28, 3);
        }
    }
    fill(170, 120, 30); rect(0, 0, 12, 400); rect(388, 0, 12, 400);
    fill(230, 180, 60); rect(3, 0, 3, 400); rect(391, 0, 3, 400);
    // falling glitter + coins piled on the floor
    for (var s = 0; s < 10; s++) { tresSparkle((s * 41 + frameCount * 0.6) % 400, (s * 67 + frameCount * 1.2) % 400, 3 + sin(frameCount * 9 + s * 50) * 1.5, 200); }
    fill(150, 100, 20); rect(0, 372, 400, 28);
    for (var p = 0; p < 12; p++) { tresCoin((p * 37) % 400, 378 + (p % 3) * 5, 12); }
};
var gaTitle = function(name, sub) {
    noStroke();
    fill(60, 40, 10, 230); rect(56, 18, 288, 36, 6);
    fill(240, 200, 80); rect(56, 18, 288, 3, 6);
    fill(255, 230, 140); textSize(13); textAlign(CENTER); text(name, 200, 35);
    fill(230, 200, 140); textSize(8);
    var sw = textWidth(sub); if (sw > 280) { textSize(8 * 280 / sw); }
    text(sub, 200, 48);
};
// ---- G-1: THE GOLD CART. slide the gold bars so the cart can roll out the exit ----
var GA_RX = 68;
var GA_RY = 76;
var GA_RS = 44;
var gaRushCells = function(V, P) {
    var g = []; for (var i = 0; i < 36; i++) { g.push(-1); }
    for (var v = 0; v < V.length; v++) {
        for (var k = 0; k < V[v][2]; k++) {
            var r = V[v][0] ? V[v][1] : P[v] + k; var c = V[v][0] ? P[v] + k : V[v][1];
            g[r * 6 + c] = v;
        }
    }
    return g;
};
var gaRushCan = function(V, P, v, dir) {
    var np = P[v] + dir;
    if (np < 0 || np + V[v][2] > 6) { return false; }
    var cell = dir < 0 ? np : np + V[v][2] - 1;
    var r = V[v][0] ? V[v][1] : cell; var c = V[v][0] ? cell : V[v][1];
    return gaRushCells(V, P)[r * 6 + c] === -1;
};
var drawGaRush = function() {
    var G = goldArea; var i;
    gaTitle("G-1  THE GOLD CART", "slide the gold bars out of the way so the cart can roll out the EXIT.");
    fill(230, 200, 140); textSize(8); textAlign(CENTER); text("click near the END of a bar to slide it that way", 200, 68);
    fill(60, 40, 14); rect(GA_RX - 8, GA_RY - 8, GA_RS * 6 + 16, GA_RS * 6 + 16, 6);
    fill(36, 24, 10); rect(GA_RX - 2, GA_RY - 2, GA_RS * 6 + 4, GA_RS * 6 + 4, 3);
    for (i = 0; i < 36; i++) { fill(48, 32, 12); rect(GA_RX + (i % 6) * GA_RS + 2, GA_RY + floor(i / 6) * GA_RS + 2, GA_RS - 4, GA_RS - 4, 3); }
    // the exit
    fill(255, 230, 120, 120 + sin(frameCount * 6) * 80); rect(GA_RX + GA_RS * 6 + 2, GA_RY + 2 * GA_RS + 4, 18, GA_RS - 8, 3);
    fill(255, 240, 180); textSize(9); text("EXIT", GA_RX + GA_RS * 6 + 11, GA_RY + 2 * GA_RS - 4);
    for (var v = 0; v < G.V.length; v++) {
        var x = GA_RX + (G.V[v][0] ? G.P[v] : G.V[v][1]) * GA_RS; var y = GA_RY + (G.V[v][0] ? G.V[v][1] : G.P[v]) * GA_RS;
        var w = G.V[v][0] ? G.V[v][2] * GA_RS : GA_RS; var h = G.V[v][0] ? GA_RS : G.V[v][2] * GA_RS;
        if (v === 0) { x += G.out * 6; }
        if (v === 0) {
            // the cart (full of gold)
            fill(110, 70, 30); rect(x + 4, y + 8, w - 8, h - 16, 5);
            fill(140, 90, 40); rect(x + 4, y + 8, w - 8, 5, 5);
            for (var cn = 0; cn < 5; cn++) { tresCoin(x + 16 + cn * 13, y + 10 - (cn % 2) * 3, 12); }
            fill(40); ellipse(x + 18, y + h - 7, 12, 12); ellipse(x + w - 18, y + h - 7, 12, 12);
            fill(150); ellipse(x + 18, y + h - 7, 4, 4); ellipse(x + w - 18, y + h - 7, 4, 4);
        } else {
            fill(160, 105, 20); rect(x + 4, y + 4, w - 8, h - 8, 4);
            fill(240, 190, 60); rect(x + 6, y + 6, w - 12, h - 12, 3);
            fill(255, 230, 140); if (G.V[v][0]) { rect(x + 8, y + 8, w - 16, 4, 2); } else { rect(x + 8, y + 8, 4, h - 16, 2); }
            fill(170, 115, 20); textSize(7); text("999", x + w / 2, y + h / 2 + 3);
        }
    }
    if (G.out > 0) {
        G.out++;
        if (G.out === 30) { G.solved = 1; flash(255, 230, 140, 90); l9Say("the gold cart rolls out! ( > )", 200, 360); }
        if (G.out > 30) { G.out = 30; }
    }
    fill(60, 40, 10, 210); rect(150, 352, 100, 18, 5);
    fill(255, 230, 140); textSize(9); text("START OVER", 200, 365);
    fill(230, 200, 140); textSize(8); text("moves: " + G.moves, 340, 365);
};
var gaRushPressed = function() {
    var G = goldArea;
    if (G.out > 0) { return; }
    if (mouseX > 150 && mouseX < 250 && mouseY > 352 && mouseY < 370) { G.P = G.P0.slice(0); G.moves = 0; return; }
    var c = floor((mouseX - GA_RX) / GA_RS); var r = floor((mouseY - GA_RY) / GA_RS);
    if (c < 0 || r < 0 || c > 5 || r > 5) { return; }
    var v = gaRushCells(G.V, G.P)[r * 6 + c];
    if (v < 0) { return; }
    var along = G.V[v][0] ? (mouseX - GA_RX) / GA_RS - G.P[v] : (mouseY - GA_RY) / GA_RS - G.P[v];
    var dir = along < G.V[v][2] / 2 ? -1 : 1;
    if (gaRushCan(G.V, G.P, v, dir)) { G.P[v] += dir; G.moves++; }
    else if (gaRushCan(G.V, G.P, v, -dir)) { G.P[v] -= dir; G.moves++; }
    else { l9Say("*CLUNK* that bar is stuck.", 200, 360); }
    if (G.P[0] === 4) { G.out = 1; }
};
// ---- G-2: THE MAGIC HOARD. 1-9 coins in each pile, every row, column and diagonal = 15 ----
var drawGaMagic = function() {
    var G = goldArea; var i;
    gaTitle("G-2  THE MAGIC HOARD", "put 1 to 9 coins in the piles (each number once). EVERY row, column + diagonal = 15.");
    fill(230, 200, 140); textSize(8); textAlign(CENTER); text("click a pile to add a coin. the glowing ones are stuck.", 200, 68);
    var S = 80; var x0 = 80; var y0 = 84;
    fill(60, 40, 14); rect(x0 - 8, y0 - 8, S * 3 + 16, S * 3 + 16, 6);
    for (i = 0; i < 9; i++) {
        var x = x0 + (i % 3) * S; var y = y0 + floor(i / 3) * S;
        fill(G.given[i] ? 110 : 80, G.given[i] ? 78 : 56, 26); rect(x + 2, y + 2, S - 4, S - 4, 5);
        if (G.given[i]) { fill(255, 230, 120, 40 + sin(frameCount * 5) * 20); rect(x + 2, y + 2, S - 4, S - 4, 5); }
        for (var k = 0; k < G.mag[i]; k++) { tresCoin(x + 18 + (k % 3) * 22, y + S - 16 - floor(k / 3) * 14, 16); }
        fill(255, 240, 180); textSize(14); text(G.mag[i] > 0 ? "" + G.mag[i] : "", x + S - 12, y + 18);
    }
    // the sums
    textSize(10);
    for (i = 0; i < 3; i++) {
        var rs = G.mag[i * 3] + G.mag[i * 3 + 1] + G.mag[i * 3 + 2];
        var cs = G.mag[i] + G.mag[i + 3] + G.mag[i + 6];
        fill(rs === 15 ? 140 : 230, rs === 15 ? 255 : 200, rs === 15 ? 140 : 140); text("= " + rs, x0 + S * 3 + 22, y0 + i * S + S / 2 + 4);
        fill(cs === 15 ? 140 : 230, cs === 15 ? 255 : 200, cs === 15 ? 140 : 140); text("" + cs, x0 + i * S + S / 2, y0 + S * 3 + 22);
    }
};
var gaMagicPressed = function() {
    var G = goldArea;
    var S = 80; var c = floor((mouseX - 80) / S); var r = floor((mouseY - 84) / S);
    if (c < 0 || r < 0 || c > 2 || r > 2) { return; }
    var i = r * 3 + c;
    if (G.given[i]) { l9Say("that pile is glued down.", 200, 360); return; }
    G.mag[i] = G.mag[i] % 9 + 1;
    for (var k = 0; k < 9; k++) { if (G.mag[k] !== G.magSol[k]) { return; } }
    G.solved = 1; flash(255, 230, 140, 90); l9Say("15 everywhere! the hoard is MAGIC! ( > )", 200, 360);
};
// ---- G-3: THE LAST COIN. take turns with Grabbit the goblin. whoever takes the LAST coin wins ----
var gaNimMove = function(p) {
    // Grabbit plays perfectly (if he can)
    var x = p[0] ^ p[1] ^ p[2];
    if (x !== 0) {
        for (var i = 0; i < 3; i++) { var t = p[i] ^ x; if (t < p[i]) { return [i, p[i] - t]; } }
    }
    var big = 0; for (var j = 1; j < 3; j++) { if (p[j] > p[big]) { big = j; } }
    return [big, 1];
};
var drawGaNim = function() {
    var G = goldArea; var i; var k;
    gaTitle("G-3  THE LAST COIN", "take turns with GRABBIT. take 1 or more coins from ONE pile. take the LAST coin to win!");
    fill(230, 200, 140); textSize(8); textAlign(CENTER); text("click a coin: you take it AND every coin above it. you go first.", 200, 68);
    // Grabbit the goblin
    var gx = 330; var gy = 120;
    fill(90, 150, 70); ellipse(gx, gy + 24, 44, 46); ellipse(gx, gy - 4, 40, 36);
    triangle(gx - 18, gy - 8, gx - 38, gy - 18, gx - 16, gy + 2); triangle(gx + 18, gy - 8, gx + 38, gy - 18, gx + 16, gy + 2);
    fill(255, 230, 80); ellipse(gx - 8, gy - 6, 10, 10); ellipse(gx + 8, gy - 6, 10, 10);
    fill(20); ellipse(gx - 8, gy - 6, 4, 6); ellipse(gx + 8, gy - 6, 4, 6);
    fill(40, 20, 10); arc(gx, gy + 6, 18, 12, 0, 180);
    fill(255); triangle(gx - 5, gy + 6, gx - 2, gy + 6, gx - 3.5, gy + 10); triangle(gx + 2, gy + 6, gx + 5, gy + 6, gx + 3.5, gy + 10);
    fill(120, 70, 30); rect(gx - 14, gy + 30, 28, 18, 4); tresCoin(gx, gy + 30, 12);
    fill(255, 240, 200); textSize(9); text("GRABBIT", gx, gy + 62);
    // the 3 piles
    for (i = 0; i < 3; i++) {
        var px = 70 + i * 80;
        fill(70, 48, 16); ellipse(px, 352, 64, 14);
        for (k = 0; k < G.nim[i]; k++) {
            var hover = (G.turn === 0 && !G.over && abs(mouseX - px) < 24 && mouseY < 346 - k * 22 + 11 && mouseY > 130);
            tresCoin(px, 340 - k * 22, hover ? 34 : 30);
        }
        fill(255, 240, 180); textSize(12); text("" + G.nim[i], px, 372);
    }
    if (G.turn === 1 && !G.over) {
        G.wait++;
        fill(255, 240, 200); textSize(10); text("Grabbit is thinking...", 330, 196);
        if (G.wait > 50) {
            var m = gaNimMove(G.nim);
            G.nim[m[0]] -= m[1];
            l9Say("Grabbit takes " + m[1] + " from pile " + (m[0] + 1) + ". hehehe.", 200, 360);
            G.turn = 0; G.wait = 0;
            if (G.nim[0] + G.nim[1] + G.nim[2] === 0) {
                G.over = 1; shake(4);
                l9Say("HAHA! I GOT THE LAST COIN! (click to try a new game)", 200, 360);
            }
        }
    }
    if (G.turn === 0 && !G.over) { fill(150, 255, 150); textSize(11); text("YOUR TURN", 330, 196); }
};
var gaNimPressed = function() {
    var G = goldArea;
    if (G.over) { G.nim = GA_NIM_START[floor(random(0, GA_NIM_START.length))].slice(0); G.turn = 0; G.over = 0; G.wait = 0; return; }
    if (G.turn !== 0) { return; }
    for (var i = 0; i < 3; i++) {
        var px = 70 + i * 80;
        if (abs(mouseX - px) > 24) { continue; }
        for (var k = 0; k < G.nim[i]; k++) {
            var cy = 340 - k * 22;
            if (abs(mouseY - cy) < 11) {
                var take = G.nim[i] - k;
                G.nim[i] = k;
                burst(px, cy, 255, 220, 100, 8, 2, 0.1);
                if (G.nim[0] + G.nim[1] + G.nim[2] === 0) { G.solved = 1; flash(255, 230, 140, 100); l9Say("YOU took the last coin!! Grabbit is FURIOUS. ( > )", 200, 360); return; }
                G.turn = 1; G.wait = 0;
                return;
            }
        }
    }
};
// ---------- MORE GOLD AREA ROOMS (G-4 to G-6) ----------
var GA_CROWNS = [[[0,0,0,0,1,1,0,3,0,1,1,1,3,3,3,3,1,2,3,3,3,3,1,2,3,3,3,3,4,4,5,3,3,3,4,4],[1,3,5,2,4,0]],[[1,1,1,0,0,0,1,1,1,0,0,2,1,1,5,5,2,2,1,5,5,3,5,2,4,5,5,5,5,2,5,5,5,5,5,5],[4,1,5,3,0,2]],[[2,2,1,1,1,0,2,2,1,1,1,1,2,2,1,3,3,3,4,4,1,3,3,3,4,4,4,3,3,3,5,4,4,3,3,3],[5,3,1,4,2,0]],[[1,1,0,0,0,0,1,2,2,2,0,0,2,2,2,2,0,3,4,2,2,2,3,3,4,4,4,4,4,5,4,4,4,4,4,5],[3,0,2,4,1,5]],[[2,2,1,1,1,0,2,2,1,1,1,1,2,2,2,1,1,1,2,2,2,3,3,3,4,4,4,4,3,4,5,5,4,4,4,4],[5,3,1,4,2,0]],[[1,1,0,2,3,3,1,1,1,2,3,3,1,1,2,2,3,3,4,4,5,3,3,3,4,4,5,5,3,3,4,4,5,5,5,5],[2,0,3,5,1,4]],[[2,2,2,0,0,1,2,2,2,2,3,1,2,2,2,2,3,1,2,2,3,3,3,3,5,4,4,4,3,3,5,5,5,5,3,3],[3,5,1,4,2,0]],[[0,0,0,1,1,1,2,2,2,1,1,1,2,2,3,3,1,1,2,2,3,3,3,3,2,3,3,3,3,4,5,3,3,3,3,4],[2,4,1,3,5,0]]];
var GA_SHIPS = [[[0,0,0,0,0,0,1,1,0,1,0,1,0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,1,1,0],[0,4,0,4,0,2],[1,2,1,3,1,2],[34,1,20,1]],[[1,0,0,1,0,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1,0,0,1,1,1,0,0,0,0,0,0],[2,1,2,1,4,0],[4,0,1,2,2,1],[4,0]],[[0,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0],[1,1,4,2,1,1],[2,0,4,0,2,2],[28,0]],[[1,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1,0,0,1,1,0,1,0,0,0,0,0,1,0],[3,1,1,1,3,1],[1,1,3,0,3,2],[24,0]],[[1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],[3,0,2,3,1,1],[2,1,0,4,0,3],[27,1,35,1]],[[1,0,1,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1,1],[3,1,1,2,0,3],[1,2,1,1,2,3],[19,1,33,1]],[[0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,0,0,1,0,1,0,1],[1,2,0,3,1,3],[0,4,0,3,1,2],[19,0]],[[0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,0,1,1],[1,0,4,1,0,4],[1,1,2,2,1,3],[3,1]]];
// ---- G-4: THE CROWN JEWELS. one crown in every row, column and color. crowns never touch ----
var GA_JC = [[230, 90, 110], [90, 170, 230], [120, 200, 110], [240, 200, 70], [180, 110, 230], [240, 150, 80]];
var drawGaCrowns = function() {
    var G = goldArea; var i;
    gaTitle("G-4  THE CROWN JEWELS", "put ONE crown in every row, every column and every color. crowns can't touch (not even corners).");
    fill(230, 200, 140); textSize(8); textAlign(CENTER); text("click: crown > X > empty", 200, 68);
    var x0 = 62; var y0 = 80; var S = 46;
    for (i = 0; i < 36; i++) {
        var x = x0 + (i % 6) * S; var y = y0 + floor(i / 6) * S;
        var c = GA_JC[G.reg[i]];
        fill(c[0] * 0.8, c[1] * 0.8, c[2] * 0.8); rect(x, y, S, S);
        fill(c[0], c[1], c[2]); rect(x + 2, y + 2, S - 4, S - 4, 3);
        // thick lines between different colors
        fill(40, 26, 8);
        if (i % 6 < 5 && G.reg[i + 1] !== G.reg[i]) { rect(x + S - 2, y, 4, S); }
        if (i < 30 && G.reg[i + 6] !== G.reg[i]) { rect(x, y + S - 2, S, 4); }
        if (G.cr[i] === 1) {
            fill(250, 205, 60); rect(x + 11, y + 22, 24, 10, 2);
            triangle(x + 11, y + 23, x + 15, y + 10, x + 19, y + 23); triangle(x + 19, y + 23, x + 23, y + 7, x + 27, y + 23); triangle(x + 27, y + 23, x + 31, y + 10, x + 35, y + 23);
            fill(230, 40, 70); ellipse(x + 23, y + 27, 6, 6);
        } else if (G.cr[i] === 2) {
            stroke(60, 40, 20, 160); strokeWeight(2); line(x + 16, y + 16, x + 30, y + 30); line(x + 30, y + 16, x + 16, y + 30); noStroke();
        }
    }
    noFill(); stroke(40, 26, 8); strokeWeight(4); rect(x0, y0, S * 6, S * 6); noStroke();
};
var gaCrownsPressed = function() {
    var G = goldArea;
    var c = floor((mouseX - 62) / 46); var r = floor((mouseY - 80) / 46);
    if (c < 0 || r < 0 || c > 5 || r > 5) { return; }
    G.cr[r * 6 + c] = (G.cr[r * 6 + c] + 1) % 3;
    for (var rr = 0; rr < 6; rr++) {
        for (var cc = 0; cc < 6; cc++) {
            var want = G.crSol[rr] === cc ? 1 : 0;
            if ((G.cr[rr * 6 + cc] === 1 ? 1 : 0) !== want) { return; }
        }
    }
    G.solved = 1; flash(255, 230, 140, 100); l9Say("every crown in its place! ( > )", 200, 360);
};
// ---- G-5: THE VAULT LOCK. a 3-number code. the clues say which numbers are right ----
var gaLockScore = function(g, code) {
    var a = 0; var b = 0;
    for (var i = 0; i < 3; i++) {
        if (g[i] === code[i]) { a++; } else if (code.indexOf(g[i]) >= 0) { b++; }
    }
    return [a, b];
};
var gaLockText = function(s) {
    if (s[0] === 0 && s[1] === 0) { return "nothing is right."; }
    var t = "";
    if (s[0] > 0) { t += s[0] + " right AND in the right spot"; }
    if (s[0] > 0 && s[1] > 0) { t += ",  "; }
    if (s[1] > 0) { t += s[1] + " right but WRONG spot"; }
    return t + ".";
};
var gaMakeLock = function() {
    var G = goldArea;
    for (var tries = 0; tries < 200; tries++) {
        var code = [];
        while (code.length < 3) { var d = floor(random(0, 10)); if (code.indexOf(d) < 0) { code.push(d); } }
        var all = [];
        for (var x = 0; x < 10; x++) { for (var y = 0; y < 10; y++) { for (var z = 0; z < 10; z++) { if (x !== y && y !== z && x !== z) { all.push([x, y, z]); } } } }
        var clues = [];
        var cand = all;
        for (var k = 0; k < 40 && cand.length > 1 && clues.length < 6; k++) {
            var g = [];
            while (g.length < 3) { var d2 = floor(random(0, 10)); if (g.indexOf(d2) < 0) { g.push(d2); } }
            var s = gaLockScore(g, code);
            if (s[0] === 3) { continue; }
            var keep = [];
            for (var c = 0; c < cand.length; c++) { var s2 = gaLockScore(g, cand[c]); if (s2[0] === s[0] && s2[1] === s[1]) { keep.push(cand[c]); } }
            if (keep.length < cand.length) { cand = keep; clues.push([g, s]); }
        }
        if (cand.length === 1 && clues.length >= 4) { G.code = code; G.clues = clues; G.dial = [0, 0, 0]; return; }
    }
    G.code = [6, 4, 2]; G.clues = [[[6, 8, 2], [2, 0]], [[6, 1, 4], [1, 1]], [[2, 0, 6], [0, 2]], [[7, 3, 8], [0, 0]], [[7, 8, 0], [0, 0]]]; G.dial = [0, 0, 0];
};
var drawGaLock = function() {
    var G = goldArea; var i;
    gaTitle("G-5  THE VAULT LOCK", "the code is 3 DIFFERENT numbers. read the clues carefully...");
    fill(40, 30, 20); rect(30, 70, 340, 26 + G.clues.length * 30, 6);
    for (i = 0; i < G.clues.length; i++) {
        var y = 92 + i * 30;
        for (var k = 0; k < 3; k++) {
            tresCoin(52 + k * 26, y - 4, 22);
            fill(110, 70, 10); textSize(12); textAlign(CENTER); text("" + G.clues[i][0][k], 52 + k * 26, y);
        }
        fill(240, 225, 190); textSize(9); textAlign(LEFT); text(gaLockText(G.clues[i][1]), 132, y);
    }
    // the dials
    var dy = 300;
    fill(90, 90, 100); rect(116, dy - 30, 168, 76, 10);
    fill(130, 130, 140); rect(116, dy - 30, 168, 6, 10);
    for (i = 0; i < 3; i++) {
        var dx = 150 + i * 50;
        fill(30, 30, 36); rect(dx - 18, dy - 18, 36, 40, 5);
        fill(255, 230, 120); textSize(24); textAlign(CENTER); text("" + G.dial[i], dx, dy + 10);
        fill(200); triangle(dx - 6, dy - 22, dx + 6, dy - 22, dx, dy - 28);
        triangle(dx - 6, dy + 26, dx + 6, dy + 26, dx, dy + 32);
    }
    fill(200, 60, 50); rect(300, 286, 66, 26, 5);
    fill(255); textSize(12); text("OPEN", 333, 304);
};
var gaLockPressed = function() {
    var G = goldArea;
    for (var i = 0; i < 3; i++) {
        var dx = 150 + i * 50;
        if (abs(mouseX - dx) < 20 && mouseY > 266 && mouseY < 336) {
            if (mouseY < 300) { G.dial[i] = (G.dial[i] + 1) % 10; } else { G.dial[i] = (G.dial[i] + 9) % 10; }
            return;
        }
    }
    if (mouseX > 300 && mouseX < 366 && mouseY > 286 && mouseY < 312) {
        if (G.dial[0] === G.code[0] && G.dial[1] === G.code[1] && G.dial[2] === G.code[2]) {
            G.solved = 1; flash(255, 230, 140, 120); shake(5); l9Say("*KA-CHUNK* the vault door swings open! ( > )", 200, 360);
        } else { shake(4); l9Say("*BZZT* wrong code.", 200, 360); }
    }
};
// ---- G-6: SUNKEN TREASURE. find the treasure chests buried under the sand ----
var drawGaShips = function() {
    var G = goldArea; var i;
    gaTitle("G-6  SUNKEN TREASURE", "find the hidden chests. numbers = how many chest squares in that row / column.");
    fill(230, 200, 140); textSize(8); textAlign(CENTER); text("chests are straight lines and never touch (not even corners).  click: chest > sand > empty", 200, 68);
    var x0 = 70; var y0 = 92; var S = 42;
    for (i = 0; i < 36; i++) {
        var x = x0 + (i % 6) * S; var y = y0 + floor(i / 6) * S;
        fill(214, 190, 130); rect(x + 1, y + 1, S - 2, S - 2, 3);
        fill(196, 172, 112); ellipse(x + 12, y + 30, 10, 4); ellipse(x + 28, y + 14, 8, 3);
        var given = G.shGiven.indexOf(i) >= 0;
        var v = given ? (G.sh[i] === 1 ? 1 : 2) : G.sh[i];
        if (v === 1) {
            fill(110, 70, 34); rect(x + 6, y + 12, S - 12, S - 20, 3);
            fill(200, 160, 60); rect(x + 6, y + 18, S - 12, 4); rect(x + S / 2 - 3, y + 12, 6, S - 20);
            fill(90, 56, 26); arc(x + S / 2, y + 13, S - 12, 12, 180, 360);
        } else if (v === 2) {
            noFill(); stroke(150, 120, 70); strokeWeight(2);
            arc(x + 14, y + 22, 12, 8, 180, 360); arc(x + 26, y + 22, 12, 8, 180, 360); noStroke();
        }
        if (given) { noFill(); stroke(255, 240, 150); strokeWeight(2); rect(x + 2, y + 2, S - 4, S - 4, 3); noStroke(); }
    }
    textSize(14); textAlign(CENTER);
    for (i = 0; i < 6; i++) {
        var nr = 0; var nc = 0;
        for (var k = 0; k < 6; k++) { if (G.sh[i * 6 + k] === 1) { nr++; } if (G.sh[k * 6 + i] === 1) { nc++; } }
        fill(nr > G.shRows[i] ? 255 : 255, nr > G.shRows[i] ? 120 : 230, nr > G.shRows[i] ? 120 : 140); text("" + G.shRows[i], x0 - 14, y0 + i * S + S / 2 + 5);
        fill(nc > G.shCols[i] ? 255 : 255, nc > G.shCols[i] ? 120 : 230, nc > G.shCols[i] ? 120 : 140); text("" + G.shCols[i], x0 + i * S + S / 2, y0 - 6);
    }
    // which chests you're looking for
    fill(255, 240, 200); textSize(9); text("CHESTS:", 360, 110);
    var lens = [3, 2, 2, 1, 1, 1];
    for (i = 0; i < 6; i++) { for (var q = 0; q < lens[i]; q++) { fill(110, 70, 34); rect(340 + q * 14, 120 + i * 22, 12, 12, 2); fill(200, 160, 60); rect(340 + q * 14, 124 + i * 22, 12, 2); } }
};
var gaShipsPressed = function() {
    var G = goldArea;
    var c = floor((mouseX - 70) / 42); var r = floor((mouseY - 92) / 42);
    if (c < 0 || r < 0 || c > 5 || r > 5) { return; }
    var i = r * 6 + c;
    if (G.shGiven.indexOf(i) >= 0) { l9Say("that square is already dug up.", 200, 360); return; }
    G.sh[i] = (G.sh[i] + 1) % 3;
    for (var k = 0; k < 36; k++) {
        var mine = G.shGiven.indexOf(k) >= 0 ? G.shSol[k] : (G.sh[k] === 1 ? 1 : 0);
        if (mine !== G.shSol[k]) { return; }
    }
    G.solved = 1; flash(255, 230, 140, 100); l9Say("you found ALL the sunken treasure! ( > )", 200, 360);
};
// ---------- EVEN MORE GOLD AREA ROOMS (G-7 to G-9) ----------
// ---- G-7: GRABBIT'S MATH. use + - x / on the 4 coins to make exactly 24 ----
var ga24Solve = function(nums, exprs) {
    if (nums.length === 1) { return nums[0] === 24 ? exprs[0] : ""; }
    for (var i = 0; i < nums.length; i++) {
        for (var j = 0; j < nums.length; j++) {
            if (i === j) { continue; }
            var rest = []; var restE = [];
            for (var k = 0; k < nums.length; k++) { if (k !== i && k !== j) { rest.push(nums[k]); restE.push(exprs[k]); } }
            var a = nums[i]; var b = nums[j];
            var tries = [[a + b, "+"], [a - b, "-"], [a * b, "x"]];
            if (b !== 0 && a % b === 0) { tries.push([a / b, "/"]); }
            for (var t = 0; t < tries.length; t++) {
                if (tries[t][0] < 0) { continue; }
                var r = ga24Solve(rest.concat([tries[t][0]]), restE.concat(["(" + exprs[i] + " " + tries[t][1] + " " + exprs[j] + ")"]));
                if (r !== "") { return r; }
            }
        }
    }
    return "";
};
var gaMake24 = function() {
    var G = goldArea;
    for (var tries = 0; tries < 300; tries++) {
        var n = [];
        for (var i = 0; i < 4; i++) { n.push(1 + floor(random(0, 9))); }
        var sol = ga24Solve(n, ["" + n[0], "" + n[1], "" + n[2], "" + n[3]]);
        // no super easy ones (like 6+6+6+6 or 8x3x1x1)
        if (sol !== "" && ga24Solve([n[0] + n[1] + n[2] + n[3]], ["x"]) === "" && n[0] * n[1] * n[2] * n[3] !== 24) {
            G.m24 = n; G.v24 = n.slice(0); G.on24 = [1, 1, 1, 1]; G.sel24 = -1; G.op24 = ""; G.sol24 = sol; G.hist24 = []; return;
        }
    }
    G.m24 = [3, 3, 8, 8]; G.v24 = [3, 3, 8, 8]; G.on24 = [1, 1, 1, 1]; G.sel24 = -1; G.op24 = ""; G.sol24 = "8 / (3 - 8 / 3)"; G.hist24 = [];
};
var drawGa24 = function() {
    var G = goldArea; var i;
    gaTitle("G-7  GRABBIT'S MATH", "make EXACTLY 24 using all 4 coins.  + - x / (no fractions allowed!)");
    fill(230, 200, 140); textSize(9); textAlign(CENTER); text("click a coin, then a sign, then another coin. they squish together into the answer.", 200, 70);
    for (i = 0; i < 4; i++) {
        if (!G.on24[i]) { continue; }
        var x = 80 + i * 80; var y = 150;
        fill(G.sel24 === i ? 255 : 0, G.sel24 === i ? 255 : 0, G.sel24 === i ? 160 : 0, G.sel24 === i ? 140 : 40); ellipse(x, y + 4, 70, 70);
        tresCoin(x, y, 60);
        fill(110, 70, 10); textSize(G.v24[i] > 99 ? 16 : 24); text("" + G.v24[i], x, y + 9);
    }
    var ops = ["+", "-", "x", "/"];
    for (i = 0; i < 4; i++) {
        var ox = 110 + i * 60;
        fill(G.op24 === ops[i] ? 255 : 90, G.op24 === ops[i] ? 220 : 60, G.op24 === ops[i] ? 100 : 20); rect(ox - 22, 220, 44, 40, 6);
        fill(G.op24 === ops[i] ? 60 : 255, G.op24 === ops[i] ? 30 : 230, G.op24 === ops[i] ? 0 : 160); textSize(26); text(ops[i], ox, 249);
    }
    fill(60, 40, 10, 210); rect(150, 290, 100, 22, 5);
    fill(255, 230, 140); textSize(10); text("START OVER", 200, 305);
    fill(230, 200, 140); textSize(9);
    for (i = 0; i < G.hist24.length; i++) { text(G.hist24[i], 200, 330 + i * 12); }
    // Grabbit, watching
    fill(90, 150, 70); ellipse(360, 330, 34, 30); fill(255, 230, 80); ellipse(354, 326, 8, 8); ellipse(366, 326, 8, 8);
    fill(20); ellipse(354, 326, 3, 4); ellipse(366, 326, 3, 4);
};
var ga24Pressed = function() {
    var G = goldArea;
    if (mouseX > 150 && mouseX < 250 && mouseY > 290 && mouseY < 312) { G.v24 = G.m24.slice(0); G.on24 = [1, 1, 1, 1]; G.sel24 = -1; G.op24 = ""; G.hist24 = []; return; }
    var ops = ["+", "-", "x", "/"];
    for (var o = 0; o < 4; o++) {
        if (abs(mouseX - (110 + o * 60)) < 22 && mouseY > 220 && mouseY < 260) { if (G.sel24 >= 0) { G.op24 = ops[o]; } else { l9Say("pick a coin first!", 200, 360); } return; }
    }
    for (var i = 0; i < 4; i++) {
        if (!G.on24[i] || dist(mouseX, mouseY, 80 + i * 80, 150) > 32) { continue; }
        if (G.sel24 < 0 || G.op24 === "") { G.sel24 = i; return; }
        if (i === G.sel24) { G.sel24 = -1; G.op24 = ""; return; }
        var a = G.v24[G.sel24]; var b = G.v24[i]; var r;
        if (G.op24 === "+") { r = a + b; } else if (G.op24 === "-") { r = a - b; } else if (G.op24 === "x") { r = a * b; }
        else { if (b === 0 || a % b !== 0) { l9Say("Grabbit: \"NO FRACTIONS!\" (that doesn't divide evenly)", 200, 360); return; } r = a / b; }
        if (r < 0) { l9Say("Grabbit: \"no negative coins!\"", 200, 360); return; }
        G.hist24.push(a + " " + G.op24 + " " + b + " = " + r);
        G.on24[G.sel24] = 0; G.v24[i] = r; G.sel24 = -1; G.op24 = "";
        var left = 0; for (var k = 0; k < 4; k++) { left += G.on24[k]; }
        if (left === 1) {
            if (r === 24) { G.solved = 1; flash(255, 230, 140, 100); l9Say("24!!! Grabbit drops his calculator. ( > )", 200, 360); }
            else { shake(4); l9Say("that's " + r + ", not 24. (Grabbit laughs) click START OVER.", 200, 360); }
        }
        return;
    }
};
// ---- G-8: GOLD BAR MATH. move ONE gold bar to make the math true ----
var GA_SEG = {"1111110": 0, "0110000": 1, "1101101": 2, "1111001": 3, "0110011": 4, "1011011": 5, "1011111": 6, "1110000": 7, "1111111": 8, "1111011": 9};
var gaMatchDigit = function(st, o) { var k = ""; for (var i = 0; i < 7; i++) { k += st[o + i]; } return GA_SEG[k] === undefined ? -1 : GA_SEG[k]; };
var gaMatchTrue = function(st) {
    var a = gaMatchDigit(st, 0); var b = gaMatchDigit(st, 8); var c = gaMatchDigit(st, 15);
    if (a < 0 || b < 0 || c < 0) { return false; }
    return st[7] ? a + b === c : a - b === c;
};
// where each bar goes: [x1, y1, x2, y2] for a digit at (dx, dy)
var gaSegLine = function(s, dx, dy) {
    var w = 40; var h = 40;
    if (s === 0) { return [dx, dy, dx + w, dy]; }
    if (s === 1) { return [dx + w, dy, dx + w, dy + h]; }
    if (s === 2) { return [dx + w, dy + h, dx + w, dy + 2 * h]; }
    if (s === 3) { return [dx, dy + 2 * h, dx + w, dy + 2 * h]; }
    if (s === 4) { return [dx, dy + h, dx, dy + 2 * h]; }
    if (s === 5) { return [dx, dy, dx, dy + h]; }
    return [dx, dy + h, dx + w, dy + h];
};
var gaBar = function(i) {
    // returns the line for slot i (0-6 digit 1, 7 = the plus's up bar, 8-14 digit 2, 15-21 digit 3)
    if (i < 7) { return gaSegLine(i, 40, 140); }
    if (i === 7) { return [140, 160, 140, 200]; }
    if (i < 15) { return gaSegLine(i - 8, 190, 140); }
    return gaSegLine(i - 15, 320, 140);
};
var drawGaMatch = function() {
    var G = goldArea; var i;
    gaTitle("G-8  GOLD BAR MATH", "this math is WRONG. move exactly ONE gold bar to make it right!");
    fill(230, 200, 140); textSize(9); textAlign(CENTER); text("click a bar to pick it up, then click an empty spot to put it there.", 200, 70);
    fill(40, 26, 10); rect(20, 110, 360, 150, 8);
    for (i = 0; i < 22; i++) {
        var L = gaBar(i);
        if (G.ms[i]) {
            stroke(150, 100, 20); strokeWeight(10); line(L[0], L[1], L[2], L[3]);
            stroke(G.mSel === i ? 255 : 245, G.mSel === i ? 255 : 195, G.mSel === i ? 180 : 60); strokeWeight(7); line(L[0], L[1], L[2], L[3]);
            noStroke();
        } else if (G.mSel >= 0) {
            stroke(255, 240, 180, 60 + sin(frameCount * 8) * 40); strokeWeight(6); line(L[0], L[1], L[2], L[3]); noStroke();
        } else {
            stroke(255, 255, 255, 20); strokeWeight(5); line(L[0], L[1], L[2], L[3]); noStroke();
        }
    }
    // the - bar of the plus/minus, and the = sign (those don't move)
    stroke(245, 195, 60); strokeWeight(7); line(120, 180, 160, 180); line(250, 172, 290, 172); line(250, 192, 290, 192); noStroke();
    fill(60, 40, 10, 210); rect(150, 300, 100, 22, 5);
    fill(255, 230, 140); textSize(10); text("START OVER", 200, 315);
    if (G.mWrong > 0) { G.mWrong--; if (G.mWrong === 0) { G.ms = G.mStart.slice(0); } }
};
var gaMatchPressed = function() {
    var G = goldArea;
    if (G.mWrong > 0) { return; }
    if (mouseX > 150 && mouseX < 250 && mouseY > 300 && mouseY < 322) { G.ms = G.mStart.slice(0); G.mSel = -1; return; }
    var best = -1; var bd = 12;
    for (var i = 0; i < 22; i++) {
        var L = gaBar(i);
        var mx = (L[0] + L[2]) / 2; var my = (L[1] + L[3]) / 2;
        var d = abs(L[1] - L[3]) < 1 ? (abs(mouseX - mx) < 22 ? abs(mouseY - my) : 99) : (abs(mouseY - my) < 22 ? abs(mouseX - mx) : 99);
        if (d < bd) { bd = d; best = i; }
    }
    if (best < 0) { return; }
    if (G.mSel < 0) { if (G.ms[best]) { G.mSel = best; } return; }
    if (best === G.mSel) { G.mSel = -1; return; }
    if (G.ms[best]) { G.mSel = best; return; }
    G.ms[G.mSel] = 0; G.ms[best] = 1; G.mSel = -1;
    if (gaMatchTrue(G.ms)) { G.solved = 1; flash(255, 230, 140, 100); l9Say("the math is RIGHT now! ( > )", 200, 360); }
    else { shake(3); G.mWrong = 50; l9Say("nope, still wrong. (the bar jumps back)", 200, 360); }
};
// ---- G-9: THE TREASURE PATH. draw ONE path through every square, counting 1 to 25 ----
var GA_PX = 70;
var GA_PY = 88;
var GA_PS = 52;
var drawGaPath = function() {
    var G = goldArea; var i;
    gaTitle("G-9  THE TREASURE PATH", "draw one path through ALL 25 squares (no diagonals). the gold numbers must land on the right step.");
    fill(230, 200, 140); textSize(9); textAlign(CENTER); text("click squares next to each other to grow the path. click a square on the path to go back to it.", 200, 72);
    var stepOf = []; for (i = 0; i < 25; i++) { stepOf.push(0); }
    for (i = 0; i < G.path.length; i++) { stepOf[G.path[i]] = i + 1; }
    for (i = 0; i < 25; i++) {
        var x = GA_PX + (i % 5) * GA_PS; var y = GA_PY + floor(i / 5) * GA_PS;
        fill(stepOf[i] ? 120 : 70, stepOf[i] ? 86 : 50, stepOf[i] ? 30 : 18); rect(x + 2, y + 2, GA_PS - 4, GA_PS - 4, 5);
    }
    // the path line
    stroke(255, 220, 90, 180); strokeWeight(6);
    for (i = 1; i < G.path.length; i++) {
        var a = G.path[i - 1]; var b = G.path[i];
        line(GA_PX + (a % 5) * GA_PS + GA_PS / 2, GA_PY + floor(a / 5) * GA_PS + GA_PS / 2, GA_PX + (b % 5) * GA_PS + GA_PS / 2, GA_PY + floor(b / 5) * GA_PS + GA_PS / 2);
    }
    noStroke();
    for (i = 0; i < 25; i++) {
        var cx = GA_PX + (i % 5) * GA_PS + GA_PS / 2; var cy = GA_PY + floor(i / 5) * GA_PS + GA_PS / 2;
        var g = G.pGiv[i];
        if (g > 0) {
            var bad = stepOf[i] > 0 && stepOf[i] !== g;
            tresCoin(cx, cy, 34);
            fill(bad ? 200 : 100, bad ? 0 : 60, bad ? 0 : 10); textSize(15); text("" + g, cx, cy + 5);
        } else if (stepOf[i] > 0) {
            fill(255, 245, 210); textSize(13); text("" + stepOf[i], cx, cy + 5);
        }
    }
    fill(60, 40, 10, 210); rect(150, 356, 100, 18, 5);
    fill(255, 230, 140); textSize(9); text("START OVER", 200, 369);
};
var gaPathPressed = function() {
    var G = goldArea;
    if (mouseX > 150 && mouseX < 250 && mouseY > 354 && mouseY < 376) { G.path = []; return; }
    var c = floor((mouseX - GA_PX) / GA_PS); var r = floor((mouseY - GA_PY) / GA_PS);
    if (c < 0 || r < 0 || c > 4 || r > 4) { return; }
    var i = r * 5 + c;
    var at = G.path.indexOf(i);
    if (at >= 0) { G.path = G.path.slice(0, at + 1); return; }
    if (G.path.length > 0) {
        var last = G.path[G.path.length - 1];
        if (abs(floor(last / 5) - r) + abs(last % 5 - c) !== 1) { l9Say("the path has to go to a square right NEXT to the end.", 200, 370); return; }
    }
    G.path.push(i);
    if (G.path.length === 25) {
        for (var k = 0; k < 25; k++) { if (G.pGiv[G.path[k]] > 0 && G.pGiv[G.path[k]] !== k + 1) { l9Say("the path covers everything... but a gold number is on the wrong step!", 200, 370); return; } }
        G.solved = 1; flash(255, 230, 140, 100); l9Say("a perfect treasure path! ( > )", 200, 370);
    }
};
var gaSetupMore2 = function(room) {
    var G = goldArea; var i;
    if (room === 6) { gaMake24(); }
    else if (room === 7) {
        var M = GA_MATCH[floor(random(0, GA_MATCH.length))];
        G.ms = M.slice(0); G.mStart = M.slice(0); G.mSel = -1; G.mWrong = 0;
    } else if (room === 8) {
        var P = GA_PATH[floor(random(0, GA_PATH.length))];
        G.pSol = P[0]; G.pGiv = []; G.path = [];
        for (i = 0; i < 25; i++) { G.pGiv.push(0); }
        for (i = 0; i < P[1].length; i += 2) { G.pGiv[P[1][i + 1]] = P[1][i]; }
    }
};
var gaSetupMore = function(room) {
    var G = goldArea; var i;
    if (room === 3) {
        var P = GA_CROWNS[floor(random(0, GA_CROWNS.length))];
        G.reg = P[0]; G.crSol = P[1]; G.cr = [];
        for (i = 0; i < 36; i++) { G.cr.push(0); }
    } else if (room === 4) {
        gaMakeLock();
    } else if (room >= 6) {
        gaSetupMore2(room);
    } else if (room === 5) {
        var S = GA_SHIPS[floor(random(0, GA_SHIPS.length))];
        G.shSol = S[0]; G.shRows = S[1]; G.shCols = S[2]; G.shGiven = []; G.sh = [];
        for (i = 0; i < 36; i++) { G.sh.push(0); }
        for (i = 0; i < S[3].length; i += 2) { G.shGiven.push(S[3][i]); G.sh[S[3][i]] = S[3][i + 1]; }
    }
};
var gaSetup = function(room) {
    var G = goldArea;
    G.room = room; G.solved = 0;
    if (room === 0) {
        var pz = GA_RUSH[floor(random(0, GA_RUSH.length))];
        G.V = pz[0]; G.P = pz[1].slice(0); G.P0 = pz[1].slice(0); G.moves = 0; G.out = 0;
    } else if (room === 1) {
        G.magSol = GA_MAGIC[floor(random(0, 8))];
        // 2 stuck piles that make it only have ONE answer
        for (var t = 0; t < 100; t++) {
            var a = floor(random(0, 9)); var b = floor(random(0, 9));
            if (a === b || a === 4 || b === 4) { continue; }
            var n = 0;
            for (var m = 0; m < 8; m++) { if (GA_MAGIC[m][a] === G.magSol[a] && GA_MAGIC[m][b] === G.magSol[b]) { n++; } }
            if (n === 1) { G.given = []; G.mag = []; for (var z = 0; z < 9; z++) { G.given.push(z === a || z === b ? 1 : 0); G.mag.push(z === a || z === b ? G.magSol[z] : 0); } break; }
        }
    } else if (room === 2) {
        G.nim = GA_NIM_START[floor(random(0, GA_NIM_START.length))].slice(0); G.turn = 0; G.over = 0; G.wait = 0;
    } else {
        gaSetupMore(room);
    }
    G.made = room;
};
// tresEnd.phase 7 = the gold area, 8 = done
var drawGoldAreaPhase = function() {
    var G = goldArea; var T = tresEnd; var i;
    if (T.phase === 8) {
        gaBg();
        for (i = 0; i < 30; i++) { tresCoin((i * 53 + frameCount * 2) % 420 - 10, (i * 71 + frameCount * 3) % 420 - 10, 14); }
        for (i = 0; i < 9; i++) { var hop = abs(sin(frameCount * 6 + i * 40)) * 10; rnDrawCast(i, 30 + i * 42, 330 - hop, 0.5); }
        textAlign(CENTER);
        fill(60, 40, 0, 150); textSize(22); text("THE GOLD AREA: COMPLETE!", 202, 62);
        fill(255, 220, 60); text("THE GOLD AREA: COMPLETE!", 200, 60);
        fill(255, 245, 210); textSize(11); text("the crew is FREE... and RICH!", 200, 84);
        fill(255, 230, 140); textSize(12); text("TO BE CONTINUED...", 200, 260);
        return;
    }
    if (G.made !== G.room) { gaSetup(G.room); }
    gaBg();
    if (G.room === 0) { drawGaRush(); }
    else if (G.room === 1) { drawGaMagic(); }
    else if (G.room === 2) { drawGaNim(); }
    else if (G.room === 3) { drawGaCrowns(); }
    else if (G.room === 4) { drawGaLock(); }
    else if (G.room === 5) { drawGaShips(); }
    else if (G.room === 6) { drawGa24(); }
    else if (G.room === 7) { drawGaMatch(); }
    else { drawGaPath(); }
    if (G.solved) { fill(255, 240, 160, 160 + sin(frameCount * 6) * 80); textSize(28); textAlign(CENTER); text(">", 384, 210); }
    fill(255, 230, 140); textSize(8); textAlign(LEFT); text("THE GOLD AREA  " + (G.room + 1) + " / 9", 16, 396);
};
var goldAreaPressed = function() {
    var G = goldArea; var T = tresEnd;
    if (T.phase === 8) { return; }
    if (G.made !== G.room) { gaSetup(G.room); }
    if (G.solved && mouseX > 360 && abs(mouseY - 202) < 30) {
        if (G.room < 8) { gaSetup(G.room + 1); } else { T.phase = 8; T.t = 0; flash(255, 240, 160, 200); shake(6); }
        return;
    }
    if (G.solved) { return; }
    if (G.room === 0) { gaRushPressed(); }
    else if (G.room === 1) { gaMagicPressed(); }
    else if (G.room === 2) { gaNimPressed(); }
    else if (G.room === 3) { gaCrownsPressed(); }
    else if (G.room === 4) { gaLockPressed(); }
    else if (G.room === 5) { gaShipsPressed(); }
    else if (G.room === 6) { ga24Pressed(); }
    else if (G.room === 7) { gaMatchPressed(); }
    else { gaPathPressed(); }
};
var tsStartGiga = function() {
    var T = tresEnd;
    T.phase = 5; T.t = 0; T.x = 200; T.y = 150;
    T.hp = GIGA_HP; T.php = 5; T.hurt = 0; T.lost = 0; T.hz = []; T.atkT = -40; T.last = "";
    T.dmg = []; T.floor = []; T.carry = -1; T.mouthT = 0;
    l9Say("GIGA-TRES! ...hitting him won't work anymore. there must be ANOTHER way.", 200, 340);
};
var tsFight = function(giga) {
    var T = tresEnd; var i;
    var maxHp = giga ? GIGA_HP : 1000;
    var sc = giga ? 0.72 : 0.85;
    rnStage();
    if (!T.lost) {
        T.x = 200 + sin(T.t * (giga ? 0.9 : 0.7)) * 70;
        T.y = (giga ? 150 : 140) + sin(T.t * 1.4) * 10;
    }
    if (T.hurt > 0) { T.hurt--; }
    if (T.hitCD > 0) { T.hitCD--; }
    if (T.flashHit > 0) { T.flashHit--; }
    for (i = 0; i < 8; i++) { tresSparkle((i * 61 + frameCount) % 400, (i * 43 + frameCount * 0.5) % 300, 3, 160); }
    var bs = T.flashHit > 0 ? random(-4, 4) : 0;
    if (giga) { drawGigaTres(T.x + bs, T.y, sc); }
    else { fill(255, 220, 100, 40); ellipse(T.x, T.y + 10, 280, 220); drawTres(T.x + bs, T.y, sc, 2); }
    tsDrawBelly(T.x + bs, T.y, sc);
    // Giga-Tres opens his mouth WIDE every now and then
    var mx = T.x; var my = T.y + 8 * sc;
    var open = false;
    if (giga) {
        if (!T.lost) { T.mouthT++; }
        open = (T.mouthT % 250) >= 140;
        if (open) {
            var ok2 = min(1, ((T.mouthT % 250) - 140) / 10);
            fill(255, 120, 200, 60 + sin(frameCount * 12) * 30); ellipse(mx, my, 90 * sc * ok2 + 10, 70 * sc * ok2 + 10);
            fill(30, 0, 15); rect(mx - 34 * sc, my - 14 * sc * ok2, 68 * sc, 30 * sc * ok2 + 4, 4);
            fill(250, 235, 180);
            for (i = 0; i < 7; i++) {
                var tx = mx - 30 * sc + i * 8.5 * sc;
                triangle(tx, my - 14 * sc * ok2, tx + 6 * sc, my - 14 * sc * ok2, tx + 3 * sc, my - 14 * sc * ok2 + 6);
            }
            if ((T.mouthT % 250) === 141) { l9Say("AAAAAH!  (his mouth is wide open)", mx, my - 120 * sc); }
        }
    }
    if (T.flashHit > 0) { fill(255, 255, 255, T.flashHit * 22); ellipse(T.x, T.y + 15, 130, 115); }
    for (var dn = T.dmg.length - 1; dn >= 0; dn--) {
        var D = T.dmg[dn];
        D.t--; D.y -= 0.8;
        if (D.good) { fill(120, 255, 120, D.t * 8); } else { fill(255, 240, 120, D.t * 8); }
        textSize(D.big ? 26 : 16); textAlign(CENTER); text(D.txt, D.x, D.y);
        if (D.t <= 0) { T.dmg.splice(dn, 1); }
    }
    // coins lying on the floor (giga fight). the dull, cracked ones are FOOL'S GOLD
    if (giga) {
        for (var fc = T.floor.length - 1; fc >= 0; fc--) {
            var F = T.floor[fc];
            F.t++;
            if (F.t > 300 && frameCount % 6 < 3) { continue; }
            if (F.fake) { drawFoolCoin(F.x, F.y, 20); } else { tresCoin(F.x, F.y, 20); }
            if (F.t > 360) { T.floor.splice(fc, 1); }
        }
    }
    // pick an attack. only ONE at a time, then a little breather
    if (!T.lost) {
        if (T.hz.length === 0) { T.atkT++; }
        var rest = giga ? 24 + 26 * max(0, T.hp) / maxHp : 35 + 35 * max(0, T.hp) / maxHp;
        if (T.atkT >= rest) {
            T.atkT = 0;
            var list = giga ? TS_GIGA_ATKS : TS_ATKS;
            var pick = list[floor(random(0, list.length))];
            if (pick === T.last) { pick = list[floor(random(0, list.length))]; }
            if (giga && T.last !== "coins") {
                var fakes = 0;
                for (i = 0; i < T.floor.length; i++) { if (T.floor[i].fake) { fakes++; } }
                if (fakes === 0 && T.carry !== 1 && random(0, 1) < 0.6) { pick = "coins"; }
            }
            T.last = pick;
            tsAttack(pick);
        }
    }
    for (var hz = T.hz.length - 1; hz >= 0; hz--) {
        var Hz = T.hz[hz];
        if (!Hz) { continue; }
        if (tsHazard(Hz) && T.hz[hz] === Hz) { T.hz.splice(hz, 1); }
    }
    // feeding him a coin you're carrying
    if (giga && T.carry >= 0 && !T.lost && dist(mouseX, mouseY, mx, my) < 34) {
        if (!open) {
            if (frameCount % 40 === 0) { l9Say("*clank* (his mouth is shut. wait for it to open...)", mx, my - 110 * sc); }
        } else if (T.carry === 1) {
            T.hp -= 50; T.carry = -1;
            T.flashHit = 12; shake(10); flash(160, 255, 120, 90);
            burst(mx, my, 160, 200, 90, 30, 4, 0.05);
            T.dmg.push({x: mx, y: my - 40, t: 45, txt: "-50", big: 1});
            T.mouthT = 0;
            var blegh = ["BLEGH!!! FOOL'S GOLD!!", "IT'S FAKE!! *cough cough*", "NOOO! THAT'S NOT REAL GOLD!!", "MY TUMMY!! *GAG*"];
            l9Say(blegh[floor(random(0, blegh.length))], mx, my - 110 * sc);
        } else {
            T.hp = min(maxHp, T.hp + 40); T.carry = -1;
            burst(mx, my, 255, 220, 100, 14, 2.5, 0.05);
            T.dmg.push({x: mx, y: my - 40, t: 40, txt: "+40", good: 1});
            l9Say("MMM! REAL GOLD! (he healed!)", mx, my - 110 * sc);
        }
    }
    // you: a tiny lucky coin (and whatever you're carrying)
    if (!T.lost && (T.hurt === 0 || frameCount % 8 < 4)) {
        noStroke(); fill(255, 255, 255, 60); ellipse(mouseX, mouseY, 22, 22);
        tresCoin(mouseX, mouseY, 12);
        if (T.carry === 1) { drawFoolCoin(mouseX + 12, mouseY - 12, 18); }
        else if (T.carry === 0) { tresCoin(mouseX + 12, mouseY - 12, 18); }
    }
    // health bars
    fill(0, 0, 0, 170); rect(46, 10, 308, 34, 6);
    fill(giga ? 50 : 60, giga ? 20 : 40, giga ? 60 : 10); rect(52, 26, 296, 12, 3);
    var hpw = 296 * max(0, T.hp) / maxHp;
    if (giga) { fill(190, 70, 255); } else { fill(230, 170, 30); }
    rect(52, 26, hpw, 12, 3);
    if (giga) { fill(240, 190, 255); } else { fill(255, 230, 130); }
    rect(52, 26, hpw, 4, 3);
    if (giga) { fill(220, 140, 255); } else { fill(255, 220, 60); }
    textSize(10); textAlign(LEFT); text(giga ? "GIGA-TRES" : "MEGA TRES", 56, 22);
    fill(255); textAlign(RIGHT); text(max(0, T.hp) + " / " + maxHp, 344, 22);
    fill(0, 0, 0, 140); rect(6, 368, 110, 26, 5);
    fill(255); textSize(8); textAlign(LEFT); text("YOU", 12, 384);
    for (i = 0; i < 5; i++) { rnHeart(40 + i * 16, 381, i < T.php); }
    if (T.hurt > 30) { fill(255, 180, 0, (T.hurt - 30) * 4); rect(0, 0, 400, 400); }
    if (T.lost) {
        fill(120, 80, 10, 210); rect(0, 0, 400, 400);
        for (i = 0; i < 30; i++) { tresCoin((i * 53) % 400, 260 + (i * 37) % 140, 20); }
        textAlign(CENTER);
        fill(255, 230, 120); textSize(26); text("YOU GOT BURIED IN GOLD", 200, 180);
        fill(255, 245, 210); textSize(13); text(giga ? "(click to go back to the GIGA-TRES checkpoint)" : "(click to try again)", 200, 210);
    }
    if (T.hp <= 0) {
        flash(255, 255, 220, 160); shake(12);
        burst(T.x, T.y, 255, 220, 100, 60, 5, 0.05);
        T.hz = []; T.t = 0; T.carry = -1;
        if (giga) { T.phase = 6; l9Say("...b-blorp?", T.x, T.y - 100); }
        else { T.phase = 4; T.line = 0; T.lineT = 0; }
    }
};
var drawTresEnding = function() {
    if (!tresEnd.on || tresEnd.src !== l9Tres) { tsInit(); tresEnd.src = l9Tres; }
    var T = tresEnd;
    T.t++;
    var i;
    if (T.phase >= 7) { drawGoldAreaPhase(); drawL9Says(); return; }
    // ---- 0: the curtain closes... and opens ----
    if (T.phase === 0) {
        rnStage();
        for (i = 8; i >= 0; i--) { var h0 = rnHome(i); rnDrawCast(i, h0[0], h0[1], 1); }
        drawTres(T.x, T.y + sin(frameCount * 3) * 4, T.s, 1);
        var cl = T.t < 50 ? T.t / 50 : (T.t < 90 ? 1 : max(0, 1 - (T.t - 90) / 60));
        rnCurtains(cl);
        if (T.t === 150) { T.phase = 1; T.t = 0; l9Say("...Tres's tummy is RUMBLING.", 200, 200); }
    }
    // ---- 1: Tres EATS everyone, one at a time ----
    else if (T.phase === 1) {
        rnStage();
        T.x += (200 - T.x) * 0.04; T.y += (120 - T.y) * 0.04;
        for (i = 8; i >= 0; i--) {
            if (T.eaten[i]) { continue; }
            var cur = T.eatI < 9 && TS_EAT_ORDER[T.eatI] === i;
            if (cur && T.eatT > 22) { continue; }
            var hm = rnHome(i);
            var sk = cur ? random(-2, 2) : sin(frameCount * 20 + i * 50) * 0.8;
            rnDrawCast(i, hm[0] + sk, hm[1], 1);
        }
        var m = tsMouth();
        // the open mouth (a dark glow)
        drawTres(T.x, T.y, T.s, 1);
        fill(40, 10, 10); ellipse(m[0], m[1] + 2, 26 * T.s, (12 + abs(sin(frameCount * 12)) * 10) * T.s);
        if (T.t > 40 && T.eatI < 9) {
            var who = TS_EAT_ORDER[T.eatI];
            var hm2 = rnHome(who);
            T.eatT++;
            var tx; var ty;
            if (T.eatT <= 22) {
                var k = T.eatT / 22;
                tx = m[0] + (hm2[0] - m[0]) * k; ty = m[1] + (hm2[1] - 30 - m[1]) * k;
                tsTongue(m[0], m[1], tx, ty);
                if (T.eatT === 1) { l9Say("TRES IS EATING " + RN_NAMES[who].toUpperCase() + "!!", 200, 250); }
            } else if (T.eatT <= 50) {
                var k2 = (T.eatT - 22) / 28; k2 = k2 * k2;
                tx = hm2[0] + (m[0] - hm2[0]) * k2; ty = hm2[1] - 30 + (m[1] - hm2[1] + 30) * k2;
                tsTongue(m[0], m[1], tx, ty);
                rnDrawCast(who, tx, ty + 30 * (1 - k2), 1 - k2 * 0.85);
            } else {
                T.eaten[who] = 1; T.eatI++; T.eatT = 0;
                T.s += 0.05;
                shake(5); burst(m[0], m[1], 255, 220, 100, 14, 2.5, 0.05);
                l9Say(TS_GULPS[T.eatI - 1], m[0], m[1] - 60 * T.s);
            }
        }
        if (T.eatI >= 9) {
            T.wait++;
            if (T.wait === 30) { l9Say("he ate EVERYONE. ...and he's starting to GLOW.", 200, 300); }
            if (T.wait > 110) { T.phase = 2; T.t = 0; T.wait = 0; }
        }
    }
    // ---- 2: he evolves AGAIN (a golden cocoon of coins) ----
    else if (T.phase === 2) {
        rnStage();
        fill(255, 200, 60, min(90, T.t)); rect(0, 0, 400, 400);
        T.x = 200; T.y += (150 - T.y) * 0.05;
        var sh = T.t < 170 ? T.t / 18 : 0;
        if (T.t < 170) {
            var cov = min(1, T.t / 100);
            drawTres(T.x + random(-sh, sh), T.y + random(-sh, sh), T.s, 1);
            // coins swirl in and build a cocoon
            for (i = 0; i < 40; i++) {
                if (i > cov * 40) { break; }
                var ca = i * 37 + T.t * (3 + i % 3);
                var cr = 60 + (i % 5) * 6;
                tresCoin(T.x + cos(ca) * cr * (1 - cov * 0.2) + random(-sh, sh), T.y + sin(ca) * cr * 0.9 + random(-sh, sh), 16);
            }
            fill(240, 190, 50, cov * 230); ellipse(T.x, T.y, 150 * cov, 160 * cov);
            if (T.t > 110) {
                stroke(255, 255, 220); strokeWeight(2);
                var ck = (T.t - 110) / 60;
                line(T.x, T.y - 70, T.x + 10 * ck, T.y - 40 * ck); line(T.x + 10 * ck, T.y - 40 * ck, T.x - 14 * ck, T.y);
                line(T.x - 14 * ck, T.y, T.x + 18 * ck, T.y + 40 * ck);
                noStroke();
            }
            if (T.t === 1) { l9Say("TRES IS EVOLVING AGAIN!!!", 200, 330); }
            if (T.t % 30 === 0) { shake(3 + T.t / 30); }
        } else {
            if (T.t === 170) { flash(255, 255, 230, 255); shake(16); burst(200, 150, 255, 220, 100, 80, 6, 0); }
            fill(255, 230, 120, 50); ellipse(200, 150, 340, 260);
            drawTres(200, 150, 0.85, 2);
            tsDrawBelly(200, 150, 0.85);
            textAlign(CENTER);
            fill(0, 0, 0, 150); textSize(36); text("MEGA TRES", 202, 342);
            fill(255, 220, 60); text("MEGA TRES", 200, 340);
            fill(255, 240, 200); textSize(12); text("(he ate the whole cast. now he's HUGE.)", 200, 362);
        }
        if (T.t >= 300) { T.phase = 3; T.t = 0; T.x = 200; T.y = 150; l9Say("click him to fight! DODGE his treasure!!", 200, 360); }
    }
    // ---- 3: THE FIGHT (Mega Tres) ----
    else if (T.phase === 3) { tsFight(false); }
    // ---- 4: "YOU FOOL!" ...those were his EVOLVE POINTS. then he evolves AGAIN ----
    else if (T.phase === 4) {
        rnStage();
        T.x += (200 - T.x) * 0.05; T.y += (150 - T.y) * 0.05;
        var talking = T.line < TS_SPEECH.length;
        if (talking) {
            T.lineT++;
            drawTres(T.x + random(-1, 1), T.y, 0.85, 2);
            tsDrawBelly(T.x, T.y, 0.85);
            // the bar: it was never his health...
            var evOn = T.line >= 3;
            fill(0, 0, 0, 170); rect(46, 10, 308, 34, 6);
            if (evOn) {
                var fillK = min(1, (T.line === 3 ? T.lineT : 120) / 60);
                fill(60, 20, 70); rect(52, 26, 296, 12, 3);
                fill(190, 70, 255); rect(52, 26, 296 * fillK, 12, 3);
                fill(240, 190, 255); rect(52, 26, 296 * fillK, 4, 3);
                fill(220, 140, 255); textSize(10); textAlign(LEFT); text("EVOLVE POINTS", 56, 22);
                fill(255); textAlign(RIGHT); text(floor(1000 * fillK) + " / 1000", 344, 22);
            } else {
                fill(60, 40, 10); rect(52, 26, 296, 12, 3);
                fill(255, 220, 60); textSize(10); textAlign(LEFT); text("MEGA TRES", 56, 22);
                fill(255); textAlign(RIGHT); text("0 / 1000", 344, 22);
            }
            // the speech bubble (typed out)
            var spLine = TS_SPEECH[T.line];
            var shown = spLine.substring(0, min(spLine.length, floor(T.lineT / 2)));
            fill(0, 0, 0, 200); rect(20, 286, 360, 74, 8);
            fill(255, 220, 60); textSize(11); textAlign(LEFT); text("MEGA TRES:", 32, 304);
            fill(255); textSize(T.line === 0 || T.line === 4 ? 18 : 13); textAlign(CENTER); text(shown, 200, 334);
            fill(200, 200, 200, 120 + sin(frameCount * 6) * 80); textSize(8); text("(click)", 360, 354);
            if (T.lineT === 1) { shake(T.line === 0 || T.line === 4 ? 10 : 3); }
            if (T.lineT > spLine.length * 2 + 90) { T.line++; T.lineT = 0; }
            if (T.line >= TS_SPEECH.length) { T.t = 0; }
        } else {
            // evolving AGAIN (purple + gold)
            fill(150, 50, 200, min(100, T.t)); rect(0, 0, 400, 400);
            var sh = T.t < 170 ? T.t / 16 : 0;
            if (T.t < 170) {
                var cov = min(1, T.t / 100);
                drawTres(T.x + random(-sh, sh), T.y + random(-sh, sh), 0.85, 2);
                for (i = 0; i < 46; i++) {
                    if (i > cov * 46) { break; }
                    var ca = i * 31 + T.t * (4 + i % 3);
                    var cr = 110 + (i % 5) * 8;
                    tresCoin(T.x + cos(ca) * cr * (1 - cov * 0.3), T.y + sin(ca) * cr * 0.8, 18);
                }
                fill(200, 120, 255, cov * 200); ellipse(T.x, T.y, 230 * cov, 240 * cov);
                if (T.t === 1) { l9Say("MEGA TRES IS EVOLVING AGAIN!!!", 200, 360); }
                if (T.t % 25 === 0) { shake(3 + T.t / 25); }
            } else {
                if (T.t === 170) { flash(255, 230, 255, 255); shake(18); burst(200, 150, 220, 140, 255, 90, 6, 0); }
                drawGigaTres(200, 160, 0.72);
                tsDrawBelly(200, 160, 0.72);
                textAlign(CENTER);
                fill(0, 0, 0, 150); textSize(40); text("GIGA-TRES", 202, 352);
                fill(220, 140, 255); text("GIGA-TRES", 200, 350);
                fill(255, 240, 200); textSize(11); text("(CHECKPOINT! if you lose, you start back here)", 200, 372);
            }
            if (T.t >= 320) { tsStartGiga(); }
        }
    }
    // ---- 5: THE GIGA-TRES FIGHT (hitting him does NOTHING) ----
    else if (T.phase === 5) { tsFight(true); }
    // ---- 6: Giga-Tres EXPLODES into coins, the crew is free, and THE GOLD AREA opens ----
    else {
        rnStage();
        if (T.t < 80) {
            var sh2 = T.t / 6;
            fill(255, 230, 140, T.t * 2.5); ellipse(T.x, T.y, 200 + T.t * 3, 180 + T.t * 3);
            drawGigaTres(T.x + random(-sh2, sh2), T.y + random(-sh2, sh2), 0.72 + T.t * 0.002);
            tsDrawBelly(T.x, T.y, 0.72);
            if (T.t % 12 === 0) { burst(T.x + random(-60, 60), T.y + random(-60, 60), 255, 220, 100, 10, 3, 0); }
            if (T.t === 1) { l9Say("N-NO!! TOO MUCH FOOL'S GOLD!!!", T.x, T.y - 130); }
        } else {
            if (!T.boom || T.boom.length === 0) {
                flash(255, 245, 200, 255); shake(18);
                T.boom = [];
                for (i = 0; i < 70; i++) { var ba = random(0, 360); var bv = random(2, 9); T.boom.push({x: T.x, y: T.y, vx: cos(ba) * bv, vy: sin(ba) * bv - 4, fake: i % 5 === 0 ? 1 : 0}); }
                l9Say("GIGA-TRES EXPLODED INTO COINS!!!", 200, 200);
            }
            // coins everywhere
            for (i = 0; i < T.boom.length; i++) {
                var B = T.boom[i];
                B.vy += 0.35; B.x += B.vx; B.y += B.vy;
                if (B.y > 330 + (i % 5) * 8) { B.y = 330 + (i % 5) * 8; B.vy = -B.vy * 0.35; B.vx *= 0.7; }
                if (B.x < 0 || B.x > 400) { B.vx = -B.vx; }
                if (B.fake) { drawFoolCoin(B.x, B.y, 14); } else { tresCoin(B.x, B.y, 14); }
            }
            // the crew falls out and lands on the stage
            for (i = 8; i >= 0; i--) {
                var fk = constrain((T.t - 85 - i * 6) / 40, 0, 1);
                var hm = rnHome(i);
                var cx = T.x + (hm[0] - T.x) * fk; var cy = T.y + (hm[1] - T.y) * fk - sin(fk * 180) * 80;
                if (T.t > 85 + i * 6) { rnDrawCast(i, cx, cy, 0.3 + 0.7 * fk); }
            }
            if (T.t === 160) { l9Say("the crew is FREE!!!", 200, 200); }
            // the secret GOLD door
            if (T.t > 190) {
                var k = min(1, (T.t - 190) / 60);
                fill(255, 220, 90, 50 + sin(frameCount * 4) * 30); ellipse(200, 130, 170 * k + 10, 190 * k + 10);
                fill(120, 80, 20); rect(158, 66, 84, 140 * k, 8);
                fill(240, 190, 60); rect(164, 72, 72, 134 * k - 6, 6);
                fill(255, 230, 140); rect(170, 78, 26, 120 * k - 20, 3); rect(204, 78, 26, 120 * k - 20, 3);
                if (k >= 1) {
                    tresGem(200, 60, 18, 230, 40, 70);
                    fill(80, 50, 10); ellipse(224, 140, 8, 8);
                    textAlign(CENTER);
                    fill(0, 0, 0, 150); textSize(20); text("THE GOLD AREA", 202, 238);
                    fill(255, 220, 60); text("THE GOLD AREA", 200, 236);
                    fill(255, 240, 200, 150 + sin(frameCount * 6) * 90); textSize(10); text("(a secret door! click it)", 200, 252);
                }
            }
        }
    }
    drawL9Says();
};
var tsPressed = function() {
    var T = tresEnd;
    if (T.phase >= 7) { goldAreaPressed(); return; }
    if (T.phase === 6) {
        if (T.t > 250 && mouseX > 150 && mouseX < 250 && mouseY > 60 && mouseY < 210) {
            T.phase = 7; T.t = 0; goldArea = {room: 0, solved: 0, made: -1};
            flash(255, 230, 140, 160);
        }
        return;
    }
    if (T.phase === 4 && T.line < TS_SPEECH.length) {
        var full = TS_SPEECH[T.line].length * 2;
        if (T.lineT < full) { T.lineT = full; } else { T.line++; T.lineT = 0; if (T.line >= TS_SPEECH.length) { T.t = 0; } }
        return;
    }
    if (T.phase !== 3 && T.phase !== 5) { return; }
    var giga = T.phase === 5;
    if (T.lost) {
        if (giga) { tsStartGiga(); l9Say("CHECKPOINT! back to GIGA-TRES.", 200, 340); } else { tsResetFight(); }
        return;
    }
    if (giga && T.carry < 0) {
        // pick up a coin off the floor
        for (var fc = T.floor.length - 1; fc >= 0; fc--) {
            if (dist(mouseX, mouseY, T.floor[fc].x, T.floor[fc].y) < 16) {
                var best = fc; var bd = 999;
                for (var f2 = 0; f2 < T.floor.length; f2++) { var dd2 = dist(mouseX, mouseY, T.floor[f2].x, T.floor[f2].y); if (dd2 < bd) { bd = dd2; best = f2; } }
                T.carry = T.floor[best].fake; T.floor.splice(best, 1);
                l9Say(T.carry ? "you picked up a dull, cracked coin..." : "you picked up a shiny gold coin.", 200, 340);
                return;
            }
        }
    }
    if (T.hitCD > 0) { return; }
    var s2 = giga ? 0.72 : 0.85;
    var ex = (mouseX - T.x) / (75 * s2); var ey = (mouseY - T.y - 18 * s2) / (67 * s2);
    if (ex * ex + ey * ey > 1) { return; }
    T.hitCD = 6;
    if (giga) {
        T.dmg.push({x: mouseX + random(-8, 8), y: mouseY - 14, t: 30, txt: "0"});
        if (frameCount - (T.lastTaunt || -999) > 70) {
            T.lastTaunt = frameCount;
            l9Say(TS_GIGA_TAUNTS[T.taunt % TS_GIGA_TAUNTS.length], T.x, T.y - 120);
            T.taunt++;
        }
        return;
    }
    T.hp -= 5;
    T.flashHit = 6;
    T.dmg.push({x: mouseX + random(-8, 8), y: mouseY - 14, t: 30, txt: "-5"});
    burst(mouseX, mouseY, 255, 220, 100, 6, 2.5, 0.05);
    shake(1.5);
};

// ---- PLAYER MONSTER + NEW FOODS FOR LEVEL 1 ----
var drawL1NewFood = function() {
    var f = l1CurrentFood;
    if (!f.visible) { return; }
    noStroke();
    if (f.type === "beetle") {
        fill(20, 20, 20);
        ellipse(f.x, f.y, 16, 10);
        fill(40, 40, 200);
        ellipse(f.x - 2, f.y, 8, 8);
        ellipse(f.x + 4, f.y, 8, 8);
        fill(120, 120, 255, 160);
        ellipse(f.x - 3, f.y - 2, 3, 2);
        ellipse(f.x + 3, f.y - 2, 3, 2);
        fill(20, 20, 20);
        ellipse(f.x + 6, f.y - 2, 6, 5);
        stroke(20, 20, 20); strokeWeight(1);
        line(f.x + 4, f.y - 3, f.x + 8, f.y - 7);
        line(f.x + 6, f.y - 2, f.x + 10, f.y - 4);
        noStroke();
    } else if (f.type === "centipede") {
        for (var c = 0; c < 7; c++) {
            fill(180, 40, 40);
            ellipse(f.x + c * 5, f.y, 7, 6);
            stroke(100, 20, 20); strokeWeight(0.5);
            line(f.x + c*5, f.y - 3, f.x + c*5 - 2, f.y - 7);
            line(f.x + c*5, f.y + 3, f.x + c*5 - 2, f.y + 7);
            noStroke();
        }
        fill(220, 60, 60);
        ellipse(f.x + 33, f.y - 1, 9, 8);
        fill(0); ellipse(f.x + 35, f.y - 3, 2, 2);
        stroke(180, 40, 40); strokeWeight(1);
        line(f.x + 36, f.y - 2, f.x + 40, f.y - 5);
        line(f.x + 36, f.y - 1, f.x + 40, f.y + 1);
        noStroke();
    } else if (f.type === "spider") {
        stroke(220, 220, 220, 150); strokeWeight(0.5);
        for (var w = 0; w < 6; w++) {
            line(f.x, f.y, f.x + cos(w * 60) * 14, f.y + sin(w * 60) * 14);
        }
        ellipse(f.x, f.y, 10, 10);
        ellipse(f.x, f.y, 20, 20);
        noStroke();
        fill(30, 30, 30);
        ellipse(f.x, f.y, 12, 10);
        ellipse(f.x + 5, f.y - 2, 8, 7);
        fill(200, 0, 0); ellipse(f.x + 4, f.y - 2, 3, 3);
        stroke(30, 30, 30); strokeWeight(1);
        for (var sl = 0; sl < 4; sl++) {
            line(f.x - 2, f.y + sl - 1, f.x - 10 - sl*2, f.y - 4 + sl*3);
            line(f.x + 8, f.y + sl - 1, f.x + 16 + sl*2, f.y - 4 + sl*3);
        }
        noStroke();
        fill(240, 240, 220, 180);
        ellipse(f.x, f.y, 16, 14);
        ellipse(f.x + 5, f.y - 2, 11, 10);
    } else if (f.type === "firefly") {
        var fglow = 150 + floor(sin(frameCount * 0.15) * 100);
        noStroke();
        fill(255, 255, fglow, 60); ellipse(f.x, f.y, 26, 26);
        fill(255, 255, fglow, 120); ellipse(f.x, f.y, 16, 16);
        fill(40, 40, 20); ellipse(f.x, f.y, 10, 7);
        ellipse(f.x + 5, f.y - 2, 7, 6);
        fill(255, 255, fglow); ellipse(f.x - 1, f.y + 2, 5, 4);
        fill(200, 200, 100, 150);
        ellipse(f.x - 5, f.y, 8, 5);
        ellipse(f.x + 3, f.y - 1, 8, 5);
    } else if (f.type === "moth") {
        var mflap = sin(frameCount * 0.2) * 4;
        noStroke();
        fill(180, 160, 130, 200);
        ellipse(f.x - 10, f.y + mflap, 16, 10);
        ellipse(f.x + 8, f.y + mflap, 16, 10);
        ellipse(f.x - 8, f.y + 4 + mflap, 10, 7);
        ellipse(f.x + 6, f.y + 4 + mflap, 10, 7);
        fill(140, 100, 60); ellipse(f.x, f.y, 8, 12);
        fill(100, 70, 40); ellipse(f.x + 2, f.y - 4, 5, 6);
        fill(80, 50, 20); ellipse(f.x + 2, f.y - 3, 2, 2);
        stroke(140, 100, 60); strokeWeight(1);
        line(f.x + 3, f.y - 6, f.x + 7, f.y - 11);
        line(f.x + 4, f.y - 6, f.x + 9, f.y - 9);
        noStroke();
        fill(80, 60, 40, 180);
        ellipse(f.x - 7, f.y + mflap, 5, 4);
        ellipse(f.x + 5, f.y + mflap, 5, 4);
    } else if (f.type === "witcheye") {
        var epulse = sin(frameCount * 0.07) * 5;
        noStroke();
        fill(150, 200, 150, 40); ellipse(f.x, f.y, 28 + epulse, 28 + epulse);
        fill(240, 230, 210); ellipse(f.x, f.y, 18, 14);
        fill(80, 180, 80); ellipse(f.x, f.y, 10, 10);
        fill(0); ellipse(f.x, f.y, 5, 5);
        fill(255, 255, 255, 200); ellipse(f.x + 2, f.y - 2, 3, 3);
        stroke(200, 180, 180, 150); strokeWeight(1);
        line(f.x - 9, f.y - 3, f.x - 14, f.y - 8);
        line(f.x - 9, f.y + 3, f.x - 14, f.y + 8);
        line(f.x + 9, f.y - 3, f.x + 14, f.y - 8);
        line(f.x + 9, f.y + 3, f.x + 14, f.y + 8);
        noStroke();
    } else if (f.type === "batwing") {
        noStroke();
        fill(40, 20, 60);
        triangle(f.x, f.y, f.x - 18, f.y - 14, f.x - 10, f.y + 8);
        triangle(f.x, f.y, f.x + 18, f.y - 14, f.x + 10, f.y + 8);
        fill(80, 40, 100, 150);
        triangle(f.x - 2, f.y - 2, f.x - 14, f.y - 10, f.x - 8, f.y + 4);
        triangle(f.x + 2, f.y - 2, f.x + 14, f.y - 10, f.x + 8, f.y + 4);
        stroke(60, 30, 80); strokeWeight(1);
        line(f.x, f.y, f.x - 18, f.y - 14);
        line(f.x, f.y, f.x - 10, f.y - 6);
        line(f.x, f.y, f.x + 18, f.y - 14);
        line(f.x, f.y, f.x + 10, f.y - 6);
        noStroke();
    } else if (f.type === "snakeegg") {
        noStroke();
        fill(180, 200, 160);
        ellipse(f.x, f.y, 14, 18);
        fill(160, 180, 140);
        ellipse(f.x - 3, f.y - 4, 5, 7);
        stroke(140, 160, 120); strokeWeight(0.5);
        for (var sp = 0; sp < 5; sp++) {
            ellipse(f.x + random(-4, 4), f.y + random(-6, 6), 2, 2);
        }
        noStroke();
        fill(100, 140, 80, 150); ellipse(f.x + 2, f.y - 5, 4, 4);
    } else if (f.type === "mystery") {
        noStroke();
        fill(120, 0, 200, 50 + sin(frameCount * 6) * 30);
        ellipse(f.x + 13, f.y - 1, 22, 22);
        fill(0, 0, 0);
        ellipse(f.x + 13, f.y - 1, 10, 10);
        fill(255, 255, 255);
        textSize(10);
        textAlign(CENTER);
        text("?", f.x + 13, f.y + 3);
    }
    fill(255, 255, 200, 180);
    textSize(7); textAlign(CENTER);
    text(l1FoodIndex + 1 + "/" + l1NewFoodTypes.length, f.x, f.y - 16);
};

var drawPlayerMonster = function() {
    if (!playerMonster.visible) { return; }
    playerMonster.angle += playerMonster.speed;
    playerMonster.x = playerMonster.cx + cos(playerMonster.angle) * playerMonster.radius;
    playerMonster.y = playerMonster.cy + sin(playerMonster.angle) * playerMonster.radius * 0.3;
    var s = playerMonster.size;
    var pulse = sin(frameCount * 0.08) * 8;
    noStroke();
    drawPurpleMonster(playerMonster.x, playerMonster.y, s, playerMonster.r, playerMonster.g, playerMonster.b, 35 * s + pulse);
    if (!monsterAteWolf) {
        fill(255, 255, 100, 200);
        textSize(7); textAlign(CENTER);
        text("fed:" + playerMonster.fedCount + "/" + l1NewFoodTypes.length, playerMonster.x, playerMonster.y - 22*s);
    }
    // draw "Forest >" button and grow monster after eating wolf
    if (monsterAteWolf) {
        // grow monster toward 2.8
        if (playerMonster.size < 2.8) {
            playerMonster.size += 0.02;
        }
        // show forest button once big enough
        if (playerMonster.size >= 2.0) {
            goToForestButton = 1;
        }
        // rumble text
        var rumble = floor(random(-2,2));
        fill(255, 0, 0);
        textSize(9); textAlign(CENTER);
        text("I WANT MORE!", playerMonster.x + rumble, playerMonster.y - 30*s);
    }
};

var drawGoToForestButtonL1 = function() {
    if (!goToForestButton) { return; }
    noStroke();
    fill(40, 20, 80);
    rect(5, 375, 85, 20);
    fill(200, 150, 255);
    textSize(10); textAlign(CENTER);
    text("Forest >", 47, 389);
};

// ============ LEVEL 10 ============
// bananas -> door -> "LEVEL 10 PT 2... 10... 20" -> CHESS (every death = 1 point for you. 5 = you lose)
// -> BREAKTIME! -> time goes backwards -> change the blueprints to a DOOR -> find the (wrong) key -> the shed -> the key machine -> YOU UNLOCK THE DOOR...
var l10T = 0;
var l10 = {phase: -1};
var L10_BCOL = [[250, 220, 60], [150, 100, 40], [250, 150, 40]];
var L10_BNAME = ["YELLOW", "BROWN", "ORANGE"];
// ---------- PART 1: THE BANANAS ----------
var l10Say = function(t) { l10.msg = t; l10.msgT = 160; };
// ---------- PART 2: CHESS ----------
// pieces: 1 pawn 2 knight 3 bishop 4 rook 5 queen 6 king. + = you (white, bottom), - = the AI
var L10_VAL = [0, 1, 3, 3, 5, 9, 100];
var l10ChessNew = function() {
    var back = [4, 2, 3, 5, 6, 3, 2, 4];
    var b = [];
    for (var i = 0; i < 64; i++) { b.push(0); }
    for (var c = 0; c < 8; c++) { b[c] = -back[c]; b[8 + c] = -1; b[48 + c] = 1; b[56 + c] = back[c]; }
    l10.board = b; l10.turn = 1; l10.sel = -1; l10.pts = 0; l10.aiT = 0; l10.over = 0; l10.overT = 0; l10.last = [-1, -1]; l10.dead = [];
};
var L10_BN = [5, 10, 20, 40, 80];      // how many bananas in each round
var L10_BUDGET = [2, 3, 4, 5, 6];    // how many WRONG bananas you can open before they all get swapped
var l10ClueTrue = function(cl, k, cols) {
    var n = cols.length;
    if (cl.t === "not") { return cols[k] !== cl.c; }
    if (cl.t === "is") { return cols[k] === cl.c; }
    if (cl.t === "less") { return k < cl.n; }
    if (cl.t === "more") { return k > cl.n; }
    if (cl.t === "between") { return k >= cl.n && k <= cl.m; }
    if (cl.t === "outside") { return k < cl.n || k > cl.m; }
    if (cl.t === "nextto") { return (k > 0 && cols[k - 1] === cl.c) || (k < n - 1 && cols[k + 1] === cl.c); }
    if (cl.t === "notnext") { return !((k > 0 && cols[k - 1] === cl.c) || (k < n - 1 && cols[k + 1] === cl.c)); }
    if (cl.t === "end") { return k === 0 || k === n - 1; }
    if (cl.t === "notend") { return k > 0 && k < n - 1; }
    if (cl.t === "even") { return (k + 1) % 2 === 0; }
    if (cl.t === "odd") { return (k + 1) % 2 === 1; }
    if (cl.t === "same") { return (k > 0 && cols[k - 1] === cols[k]) || (k < n - 1 && cols[k + 1] === cols[k]); }
    if (cl.t === "diff") { return !((k > 0 && cols[k - 1] === cols[k]) || (k < n - 1 && cols[k + 1] === cols[k])); }
    if (cl.t === "three") { return (k + 1) % 3 === 0; }
    return (k + 1) % 3 !== 0;
};
var l10ClueText = function(cl) {
    if (cl.t === "not") { return "the key is NOT in a " + L10_BNAME[cl.c] + " banana."; }
    if (cl.t === "is") { return "the key IS in a " + L10_BNAME[cl.c] + " banana."; }
    if (cl.t === "less") { return "the key's number is LESS than " + (cl.n + 1) + "."; }
    if (cl.t === "more") { return "the key's number is MORE than " + (cl.n + 1) + "."; }
    if (cl.t === "between") { return "the key's number is from " + (cl.n + 1) + " to " + (cl.m + 1) + "."; }
    if (cl.t === "outside") { return "the key's number is NOT from " + (cl.n + 1) + " to " + (cl.m + 1) + "."; }
    if (cl.t === "nextto") { return "the key is right next to a " + L10_BNAME[cl.c] + " banana."; }
    if (cl.t === "notnext") { return "the key is NOT next to any " + L10_BNAME[cl.c] + " banana."; }
    if (cl.t === "end") { return "the key is in the FIRST or LAST banana."; }
    if (cl.t === "notend") { return "the key is NOT in the first or last banana."; }
    if (cl.t === "even") { return "the key's number is EVEN."; }
    if (cl.t === "odd") { return "the key's number is ODD."; }
    if (cl.t === "same") { return "the key's banana is next to one of the SAME color."; }
    if (cl.t === "diff") { return "the bananas next to the key are a DIFFERENT color."; }
    if (cl.t === "three") { return "the key's number is in the 3 times table."; }
    return "the key's number is NOT in the 3 times table.";
};
// which bananas could still have the key? (not opened, and fits every clue you found)
var l10Cands = function() {
    var out = [];
    for (var b = 0; b < l10.cols.length; b++) {
        if (l10.open[b]) { continue; }
        var ok = true;
        for (var z = 0; z < l10.found.length; z++) { if (!l10ClueTrue(l10.found[z].cl, b, l10.cols)) { ok = false; } }
        if (ok) { out.push(b); }
    }
    return out;
};
var l10RandClue = function(n) {
    var kinds = ["not", "is", "less", "more", "between", "outside", "nextto", "notnext", "end", "notend", "even", "odd", "same", "diff", "three", "notthree"];
    var a = floor(random(0, n)); var b2 = floor(random(0, n));
    return {t: kinds[floor(random(0, kinds.length))], c: floor(random(0, 3)), n: min(a, b2), m: max(a, b2)};
};
// a WRONG banana was opened: write a TRUE clue inside it that cuts the choices about in half
var l10MakeClue = function() {
    var cand = l10Cands();
    var n = l10.cols.length;
    var target = max(1, ceil(cand.length / 2));
    var best = null; var bestScore = 9999;
    for (var t = 0; t < 400; t++) {
        var cl = l10RandClue(n);
        if (!l10ClueTrue(cl, l10.key, l10.cols)) { continue; }
        if ((cl.t === "between" || cl.t === "outside") && cl.m - cl.n < 1) { continue; }
        var dupe = false;
        for (var d = 0; d < l10.found.length; d++) { if (l10ClueText(l10.found[d].cl) === l10ClueText(cl)) { dupe = true; } }
        if (dupe) { continue; }
        var r = 0;
        for (var q = 0; q < cand.length; q++) { if (l10ClueTrue(cl, cand[q], l10.cols)) { r++; } }
        if (cand.length > 1 && r >= cand.length) { continue; }
        var score = abs(r - target) + random(0, 0.5);
        if (score < bestScore) { bestScore = score; best = cl; }
    }
    if (best === null) { best = {t: "is", c: l10.cols[l10.key], n: 0, m: 0}; }
    return best;
};
var l10MakeBananas = function() {
    var n = L10_BN[l10.round];
    for (var tries = 0; tries < 50; tries++) {
        var cols = [];
        for (var i = 0; i < n; i++) { cols.push(floor(random(0, 3))); }
        if (cols.indexOf(0) >= 0 && cols.indexOf(1) >= 0 && cols.indexOf(2) >= 0) { l10.cols = cols; break; }
    }
    l10.key = floor(random(0, n));
    l10.open = []; for (var o = 0; o < n; o++) { l10.open.push(0); }
    l10.found = []; l10.wrong = 0; l10.peel = -1; l10.peelT = 0; l10.hasKey = 0; l10.doorT = 0;
};
// where banana i sits: [x, y, size]
var l10BPos = function(i) {
    var n = l10.cols.length;
    if (n <= 5) { return [60 + i * 70, 296, 1]; }
    if (n <= 10) { return [38 + i * 36, 296, 0.62]; }
    if (n <= 20) { return [38 + (i % 10) * 36, i < 10 ? 246 : 296, 0.6]; }
    if (n <= 40) { return [38 + (i % 10) * 36, 216 + floor(i / 10) * 34, 0.46]; }
    return [27 + (i % 16) * 23, 230 + floor(i / 16) * 29, 0.34];
};
var drawL10Banana = function(x, y, c, s, state) {
    // state: 0 closed, 1 opened (mush + a clue note), 2 the key one
    var C = L10_BCOL[c];
    pushMatrix(); translate(x, y); scale(s);
    if (state === 1) {
        noStroke();
        fill(C[0] * 0.7, C[1] * 0.7, C[2] * 0.6); ellipse(0, -6, 50, 14);
        fill(250, 240, 200); ellipse(-6, -8, 20, 8);
        fill(255); rect(-2, -26, 18, 14, 1); fill(80); rect(1, -22, 12, 1.5); rect(1, -18, 9, 1.5);
        popMatrix();
        return;
    }
    noStroke();
    // shadow
    fill(0, 0, 0, 40); ellipse(0, 1, 50, 6);
    // the outline (dark) then the banana
    fill(C[0] * 0.55, C[1] * 0.5, C[2] * 0.4);
    beginShape(); vertex(-28, -21); bezierVertex(-22, 6, 20, 7, 29, -19); bezierVertex(16, -9, -14, -9, -28, -21); endShape(CLOSE);
    fill(C[0], C[1], C[2]);
    beginShape(); vertex(-25, -19); bezierVertex(-19, 3, 18, 4, 26, -17); bezierVertex(15, -10, -13, -10, -25, -19); endShape(CLOSE);
    // shading on the bottom + shine on top
    fill(C[0] * 0.82, C[1] * 0.78, C[2] * 0.7);
    beginShape(); vertex(-22, -12); bezierVertex(-14, 3, 14, 3, 22, -12); bezierVertex(12, -3, -12, -3, -22, -12); endShape(CLOSE);
    fill(min(255, C[0] + 40), min(255, C[1] + 40), min(255, C[2] + 50), 200);
    beginShape(); vertex(-17, -14); bezierVertex(-8, -9, 8, -9, 17, -13); bezierVertex(8, -11, -8, -11, -17, -14); endShape(CLOSE);
    // the ridge line
    stroke(C[0] * 0.7, C[1] * 0.65, C[2] * 0.55); strokeWeight(1);
    line(-20, -11, -6, -6); line(-6, -6, 8, -6); line(8, -6, 21, -11);
    noStroke();
    // stem (right) + dark tip (left)
    fill(110, 85, 40); quad(25, -17, 31, -27, 35, -25, 29, -15);
    fill(70, 55, 30); rect(31, -29, 5, 4, 1);
    fill(60, 45, 25); ellipse(-27, -20, 5, 5);
    if (c === 1) { fill(90, 55, 20); ellipse(-12, -6, 5, 3); ellipse(4, -3, 4, 3); ellipse(14, -8, 3, 3); ellipse(-2, -9, 3, 2); }
    if (c === 2) { fill(200, 110, 30, 150); ellipse(-6, -5, 6, 3); ellipse(10, -6, 5, 3); }
    if (state === 2) {
        // peeled open: the white banana inside + floppy peels
        fill(250, 245, 215); ellipse(0, -18, 34, 12);
        fill(C[0], C[1], C[2]);
        triangle(-16, -16, -32, -36, -8, -20); triangle(16, -16, 32, -36, 8, -20); triangle(-4, -20, 0, -40, 4, -20);
    }
    popMatrix();
};
var drawL10Key = function(x, y, s, gold) {
    pushMatrix(); translate(x, y); scale(s);
    noStroke();
    if (gold) { fill(230, 180, 50); } else { fill(170, 170, 180); }
    ellipse(-10, 0, 16, 16); rect(-4, -2.5, 22, 5, 1); rect(12, 2, 3, 6); rect(16, 2, 2, 4);
    fill(gold ? 120 : 80); ellipse(-10, 0, 6, 6);
    popMatrix();
};
var drawL10Frond = function(x, y, a, len, r, g, b) {
    pushMatrix(); translate(x, y); rotate(a);
    stroke(r * 0.7, g * 0.7, b * 0.7); strokeWeight(2); line(0, 0, len, 0); noStroke();
    for (var i = 1; i < 9; i++) {
        var px = len * i / 9; var w = sin(i * 20) * len * 0.22;
        fill(r - (i % 2) * 12, g - (i % 2) * 10, b);
        triangle(px, 0, px + len * 0.12, -w, px + len * 0.08, 0);
        triangle(px, 0, px + len * 0.12, w, px + len * 0.08, 0);
    }
    popMatrix();
};
var drawL10HutBack = function() {
    noStroke();
    var i;
    // sky + sun rays through the trees
    background(120, 175, 120);
    fill(200, 235, 180); rect(0, 0, 400, 70);
    for (i = 0; i < 5; i++) { fill(255, 250, 200, 25); quad(40 + i * 80, 0, 70 + i * 80, 0, 110 + i * 80, 70, 60 + i * 80, 70); }
    // the jungle canopy
    for (i = 0; i < 14; i++) { fill(45 + (i % 3) * 12, 95 + (i % 2) * 22, 45); ellipse((i * 37) % 430 - 10, 18 + (i % 4) * 14, 80, 46); }
    drawL10Frond(-10, 10, 20, 90, 60, 140, 60); drawL10Frond(410, 6, 160, 100, 55, 130, 55); drawL10Frond(180, -6, 70, 60, 70, 150, 70);
    // the hut wall: planks with grain, knots + nails
    for (i = 0; i < 12; i++) {
        var px = i * 36;
        fill(150 + (i % 3) * 8, 108 + (i % 2) * 6, 60); rect(px, 70, 35, 222);
        fill(130 + (i % 3) * 6, 92, 50);
        rect(px + 8, 90 + (i * 23) % 60, 1, 60); rect(px + 22, 150 + (i * 31) % 70, 1, 70); rect(px + 15, 80, 1, 30);
        fill(110, 75, 40); ellipse(px + 12 + (i * 7) % 14, 120 + (i * 53) % 150, 7, 5); fill(140, 100, 55); ellipse(px + 12 + (i * 7) % 14, 120 + (i * 53) % 150, 3, 2);
        fill(90); ellipse(px + 5, 76, 3, 3); ellipse(px + 30, 76, 3, 3); ellipse(px + 5, 286, 3, 3); ellipse(px + 30, 286, 3, 3);
        fill(100, 70, 35); rect(px + 35, 70, 1, 222);
    }
    // straw roof edge
    fill(200, 170, 90); rect(0, 60, 400, 14);
    for (i = 0; i < 50; i++) { fill(180 + (i % 3) * 15, 150 + (i % 2) * 12, 70); triangle(i * 8, 72, i * 8 + 8, 72, i * 8 + 4, 80 + (i % 3) * 3); }
    // vines hanging down
    for (i = 0; i < 3; i++) {
        var vx = [6, 284, 386][i];
        stroke(60, 110, 50); strokeWeight(2); line(vx, 70, vx + 3, 140 + i * 20); noStroke();
        for (var l = 0; l < 5; l++) { fill(70, 140, 60); ellipse(vx + (l % 2 ? 5 : -3), 82 + l * 13, 8, 5); }
    }
    // lantern
    stroke(60); strokeWeight(1); line(284, 74, 284, 90); noStroke();
    fill(255, 220, 120, 60 + sin(frameCount * 5) * 20); ellipse(284, 100, 40, 40);
    fill(60); rect(278, 90, 12, 3); fill(255, 210, 100); rect(279, 93, 10, 12, 2); fill(60); rect(278, 105, 12, 3);
    // the door: frame, planks, hinges
    fill(70, 45, 20); rect(286, 80, 94, 128, 6);
    fill(110, 70, 35); rect(296, 90, 74, 112, 4);
    for (i = 0; i < 4; i++) { fill(100 + (i % 2) * 12, 64, 30); rect(296 + i * 18.5, 90, 18, 112); fill(85, 55, 25); rect(296 + i * 18.5, 90, 1, 112); }
    fill(70, 70, 75); rect(296, 104, 22, 6, 2); rect(296, 180, 22, 6, 2);
    fill(60, 40, 20); rect(330, 136, 14, 20, 3); fill(20); ellipse(337, 144, 5, 5); rect(336, 144, 2, 6);
    // a monkey peeking around the door
    var mb = sin(frameCount * 2) * 2;
    fill(110, 70, 40); ellipse(386, 150 + mb, 26, 26); ellipse(375, 142 + mb, 9, 9);
    fill(220, 180, 140); ellipse(383, 154 + mb, 16, 13);
    fill(30); if (frameCount % 120 < 6) { rect(378, 147 + mb, 5, 1); } else { ellipse(380, 147 + mb, 4, 4); }
    fill(70, 40, 20); ellipse(382, 157 + mb, 4, 2);
    // dirt floor with pebbles + grass
    fill(110, 85, 55); rect(0, 292, 400, 108);
    for (i = 0; i < 30; i++) { fill(130 + (i % 3) * 10, 105, 70); ellipse((i * 53) % 400, 330 + (i * 37) % 60, 4 + i % 3, 3); }
    for (i = 0; i < 12; i++) { fill(70, 130, 60); var gx = (i * 71) % 400; triangle(gx, 398, gx + 4, 380 - (i % 3) * 4, gx + 8, 398); triangle(gx + 5, 398, gx + 11, 384, gx + 12, 398); }
};
var drawL10Table = function(y) {
    noStroke();
    fill(0, 0, 0, 50); ellipse(200, y + 72, 380, 14);
    fill(95, 62, 32); rect(34, y + 16, 12, 60); rect(354, y + 16, 12, 60); rect(40, y + 30, 320, 5);
    fill(130, 88, 46); rect(14, y, 372, 16, 3);
    fill(150, 104, 56); rect(14, y, 372, 4, 3);
    fill(110, 72, 38); for (var i = 0; i < 6; i++) { rect(30 + i * 60, y + 7, 40, 1); }
    // banana leaf mats
    for (var m = 0; m < 3; m++) { fill(70, 140, 60, 180); ellipse(80 + m * 120, y + 2, 100, 10); }
};
var drawL10TitleBits = function() {
    for (var i = 0; i < 6; i++) {
        var x = (i * 83 + l10T * (0.5 + i * 0.1)) % 460 - 30;
        var y = 60 + (i * 61) % 280 + sin(l10T * 2 + i * 60) * 10;
        pushMatrix(); translate(x, y); rotate(l10T * (i % 2 ? 1 : -1) + i * 40);
        drawL10Banana(0, 10, i % 3, 0.5, 0);
        popMatrix();
    }
};
var drawL10Bananas = function() {
    noStroke();
    var n = l10.cols.length;
    drawL10HutBack();
    if (l10.doorT > 0) { l10.doorT++; fill(20, 10, 5, min(255, l10.doorT * 6)); rect(296, 90, 74, 112, 4); }
    fill(255, 240, 200); textSize(10); textAlign(CENTER); text(["LEVEL 10", "LEVEL 10 PT 2", "LEVEL 10 PT 3", "LEVEL 10 PT 4", "LEVEL 10 PT 5"][l10.round], 333, 80);
    // the clue board (empty until you open a wrong banana)
    fill(90, 60, 30); rect(10, 78, 272, 100, 4);
    fill(230, 210, 160); rect(14, 82, 264, 92, 3);
    fill(60, 40, 20); textSize(9); textAlign(LEFT);
    text("CLUES (found inside the wrong bananas):", 20, 95);
    if (l10.found.length === 0) { fill(120, 100, 70); text("...nothing yet. every wrong banana has a clue in it.", 20, 112); }
    for (var i = 0; i < l10.found.length; i++) {
        fill(60, 40, 20); textSize(l10.found.length > 4 ? 8 : 9);
        if (l10.found.length > 5) { textSize(8); }
        text("#" + (l10.found[i].b + 1) + ": " + l10ClueText(l10.found[i].cl), 20, l10.found.length > 5 ? 106 + i * 10.5 : (l10.found.length > 4 ? 108 + i * 12 : 111 + i * 14));
    }
    // wrong-banana budget
    var left = L10_BUDGET[l10.round] - l10.wrong;
    fill(left > 0 ? 90 : 200, left > 0 ? 60 : 30, left > 0 ? 30 : 30); textSize(9); textAlign(RIGHT);
    text("wrong bananas you can still open: " + left, 274, 170);
    // the table(s) + bananas
    if (n > 40) {
        fill(90, 60, 30); rect(6, 230, 8, 150); rect(386, 230, 8, 150);
        for (var sh2 = 0; sh2 < 5; sh2++) { fill(120, 80, 40); rect(4, 232 + sh2 * 29, 392, 4, 2); }
    } else if (n > 20) {
        fill(90, 60, 30); rect(24, 220, 10, 140); rect(366, 220, 10, 140);
        for (var sh = 0; sh < 4; sh++) { fill(120, 80, 40); rect(14, 218 + sh * 34, 372, 6, 2); }
    } else {
        drawL10Table(300);
        if (n > 10) { fill(120, 80, 40); rect(14, 250, 372, 8, 2); }
    }
    for (var b = 0; b < n; b++) {
        var P = l10BPos(b);
        var st = l10.open[b] ? 1 : ((l10.peel === b && b === l10.key) || (l10.hasKey && b === l10.key) ? 2 : 0);
        drawL10Banana(P[0], P[1], l10.cols[b], P[2], st);
        var ly = P[1] - 50 * P[2] - 4;
        fill(255); ellipse(P[0], ly, 10 + 6 * P[2], 10 + 6 * P[2]); fill(40); textSize(n > 40 ? 5 : (n > 20 ? 6 : (n > 5 ? 7 : 10))); textAlign(CENTER); text("" + (b + 1), P[0], ly + (n > 5 ? 2.5 : 4));
    }
    if (l10.peel >= 0) {
        l10.peelT++;
        var PP = l10BPos(l10.peel);
        if (l10.peel === l10.key) {
            drawL10Key(PP[0], PP[1] - 6 - min(40, l10.peelT), 1.3, true);
            if (l10.peelT === 1) { flash(255, 240, 150, 100); l10Say("THE KEY WAS IN BANANA " + (l10.key + 1) + "!"); }
            if (l10.peelT === 50) { l10.hasKey = 1; l10.peel = -1; }
        } else { l10.peel = -1; }
    }
    if (l10.resetT > 0) {
        l10.resetT--;
        fill(0, 0, 0, 120); rect(0, 0, 400, 400);
        fill(255, 220, 120); textSize(18); textAlign(CENTER); text("TOO MUCH MUSH!", 200, 190);
        fill(255); textSize(11); text("all the bananas get swapped for new ones...", 200, 212);
        if (l10.resetT === 0) { l10MakeBananas(); }
    }
    if (l10.hasKey) {
        drawL10Key(mouseX + 14, mouseY + 10, 1, true);
        fill(255, 255, 200); textSize(10); textAlign(CENTER); text("(you have the key! click the door)", 200, 390);
    } else {
        fill(255, 255, 220); textSize(10); textAlign(CENTER); text("ONE banana has the key. open the others to find clues!", 200, 390);
    }
};
var l10BananaPressed = function() {
    if (l10.hasKey) {
        if (mouseX > 290 && mouseX < 376 && mouseY > 84 && mouseY < 204) { l10.doorT = 1; l10.phase = 1; l10.t = 0; flash(255, 240, 200, 160); }
        return;
    }
    if (l10.peel >= 0 || l10.resetT > 0) { return; }
    for (var b = 0; b < l10.cols.length; b++) {
        var P = l10BPos(b);
        if (l10.open[b] || abs(mouseX - P[0]) > 32 * P[2] || mouseY < P[1] - 60 * P[2] || mouseY > P[1] + 10) { continue; }
        if (b === l10.key) { l10.peel = b; l10.peelT = 0; return; }
        l10.open[b] = 1; l10.wrong++; shake(3);
        if (l10.wrong > L10_BUDGET[l10.round]) { l10.resetT = 120; return; }
        var cl = l10MakeClue();
        l10.found.push({b: b, cl: cl});
        l10Say("mush! but there's a note inside banana " + (b + 1) + "...");
        return;
    }
    if (mouseX > 290 && mouseX < 376 && mouseY > 84 && mouseY < 204) { l10Say("locked. the key is in one of the bananas..."); }
};
var l10Attacked = function(b, sq, by) {
    // is square sq attacked by side 'by' (1 = white, -1 = black)?
    var r = floor(sq / 8); var c = sq % 8; var i; var rr; var cc;
    // pawns
    var pr = r + by;
    if (pr >= 0 && pr < 8) {
        if (c > 0 && b[pr * 8 + c - 1] === by * 1) { return true; }
        if (c < 7 && b[pr * 8 + c + 1] === by * 1) { return true; }
    }
    var kn = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (i = 0; i < 8; i++) { rr = r + kn[i][0]; cc = c + kn[i][1]; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === by * 2) { return true; } }
    var kg = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (i = 0; i < 8; i++) { rr = r + kg[i][0]; cc = c + kg[i][1]; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === by * 6) { return true; } }
    for (i = 0; i < 8; i++) {
        var dr = kg[i][0]; var dc = kg[i][1]; var diag = dr !== 0 && dc !== 0;
        rr = r + dr; cc = c + dc;
        while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
            var p = b[rr * 8 + cc];
            if (p !== 0) {
                if (p === by * 5 || (diag && p === by * 3) || (!diag && p === by * 4)) { return true; }
                break;
            }
            rr += dr; cc += dc;
        }
    }
    return false;
};
var l10Apply = function(b, from, to) {
    var nb = b.slice(0);
    var p = nb[from];
    nb[to] = p; nb[from] = 0;
    if (abs(p) === 1 && (floor(to / 8) === 0 || floor(to / 8) === 7)) { nb[to] = p > 0 ? 5 : -5; }
    return nb;
};
var l10Moves = function(b, side) {
    // every LEGAL move for side: [from, to]
    var out = []; var i;
    var kg = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    var kn = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (var sq = 0; sq < 64; sq++) {
        var p = b[sq];
        if (p === 0 || (p > 0) !== (side > 0)) { continue; }
        var t = abs(p); var r = floor(sq / 8); var c = sq % 8; var cand = [];
        if (t === 1) {
            var f = r - side;
            if (f >= 0 && f < 8 && b[f * 8 + c] === 0) {
                cand.push(f * 8 + c);
                var start = side > 0 ? 6 : 1;
                if (r === start && b[(r - 2 * side) * 8 + c] === 0) { cand.push((r - 2 * side) * 8 + c); }
            }
            if (f >= 0 && f < 8) {
                if (c > 0 && b[f * 8 + c - 1] * side < 0) { cand.push(f * 8 + c - 1); }
                if (c < 7 && b[f * 8 + c + 1] * side < 0) { cand.push(f * 8 + c + 1); }
            }
        } else if (t === 2 || t === 6) {
            var L = t === 2 ? kn : kg;
            for (i = 0; i < 8; i++) {
                var rr = r + L[i][0]; var cc = c + L[i][1];
                if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] * side <= 0) { cand.push(rr * 8 + cc); }
            }
        } else {
            for (i = 0; i < 8; i++) {
                var dr = kg[i][0]; var dc = kg[i][1]; var diag = dr !== 0 && dc !== 0;
                if (t === 3 && !diag) { continue; }
                if (t === 4 && diag) { continue; }
                var r2 = r + dr; var c2 = c + dc;
                while (r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8) {
                    var q = b[r2 * 8 + c2];
                    if (q * side > 0) { break; }
                    cand.push(r2 * 8 + c2);
                    if (q !== 0) { break; }
                    r2 += dr; c2 += dc;
                }
            }
        }
        for (i = 0; i < cand.length; i++) {
            var nb = l10Apply(b, sq, cand[i]);
            var ks = nb.indexOf(6 * side);
            if (ks >= 0 && !l10Attacked(nb, ks, -side)) { out.push([sq, cand[i]]); }
        }
    }
    return out;
};
var l10Eval = function(b) {
    // + = good for the AI (black)
    var s = 0;
    for (var i = 0; i < 64; i++) {
        var p = b[i];
        if (p === 0) { continue; }
        var v = L10_VAL[abs(p)];
        var c = i % 8; var r = floor(i / 8);
        var center = (3.5 - abs(3.5 - c)) * 0.04 + (3.5 - abs(3.5 - r)) * 0.03;
        if (abs(p) === 6) { center = 0; }
        if (abs(p) === 1) { center += (p < 0 ? r : 7 - r) * 0.03; }
        s += p < 0 ? v + center : -(v + center);
    }
    return s;
};
var l10Search = function(b, side, depth, alpha, beta) {
    // negamax from black's point of view times side
    if (depth === 0) { return l10Eval(b) * (side < 0 ? 1 : -1); }
    var mv = l10Moves(b, side);
    if (mv.length === 0) {
        var ks = b.indexOf(6 * side);
        if (ks >= 0 && l10Attacked(b, ks, -side)) { return -1000 - depth; }
        return 0;
    }
    var best = -99999;
    for (var i = 0; i < mv.length; i++) {
        var v = -l10Search(l10Apply(b, mv[i][0], mv[i][1]), -side, depth - 1, -beta, -alpha);
        if (v > best) { best = v; }
        if (best > alpha) { alpha = best; }
        if (alpha >= beta) { break; }
    }
    return best;
};
var l10AiMove = function() {
    var b = l10.board;
    var mv = l10Moves(b, -1);
    if (mv.length === 0) { return null; }
    var best = null; var bv = -99999;
    for (var i = 0; i < mv.length; i++) {
        var nb = l10Apply(b, mv[i][0], mv[i][1]);
        var v = -l10Search(nb, 1, 1, -99999, 99999) + random(0, 0.3);
        if (v > bv) { bv = v; best = mv[i]; }
    }
    return best;
};
// what cheater suggests for YOU: good moves, but captures are bad (they give you points)
var L10_PLAN = [[52, 36], [61, 34], [59, 31], [59, 45]];   // pawn e2-e4, bishop f1-c4, queen d1-h5 (or d1-f3)
var l10Mates = function(nb) {
    // is black checkmated on board nb?
    if (l10Moves(nb, -1).length > 0) { return false; }
    var bk = nb.indexOf(-6);
    return bk >= 0 && l10Attacked(nb, bk, 1);
};
var l10HelpMove = function() {
    var b = l10.board;
    var mv = l10Moves(b, 1);
    var i;
    // 1) can you checkmate RIGHT NOW?
    for (i = 0; i < mv.length; i++) { if (l10Mates(l10Apply(b, mv[i][0], mv[i][1]))) { return mv[i]; } }
    // 2) the best SAFE move that doesn't kill anything (deaths = points!)
    var best = null; var bv = -99999; var vals = [];
    for (i = 0; i < mv.length; i++) {
        var nb2 = l10Apply(b, mv[i][0], mv[i][1]);
        var v = -l10Search(nb2, -1, 2, -99999, 99999);
        if (b[mv[i][1]] !== 0) { v -= 2.5; }
        if (l10Moves(nb2, -1).length === 0) { v -= 50; }
        vals.push(v);
        if (v > bv) { bv = v; best = mv[i]; }
    }
    // 3) but the quick plan is even better, if it's just as safe
    for (var p = 0; p < L10_PLAN.length; p++) {
        var P = L10_PLAN[p];
        for (i = 0; i < mv.length; i++) {
            if (mv[i][0] !== P[0] || mv[i][1] !== P[1] || b[P[1]] !== 0) { continue; }
            var nb = l10Apply(b, P[0], P[1]);
            if (!l10Attacked(nb, P[1], -1) && vals[i] >= bv - 0.6) { return mv[i]; }
        }
    }
    return best;
};
var L10_PNAME = ["", "PAWN", "KNIGHT (horse)", "BISHOP (pointy hat)", "ROOK (castle)", "QUEEN", "KING"];
var l10Sq = function(q) { return "abcdefgh".charAt(q % 8) + (8 - floor(q / 8)); };
var l10MoveWords = function(m) {
    var b = l10.board;
    var w = "move your " + L10_PNAME[abs(b[m[0]])] + " from " + l10Sq(m[0]) + " to " + l10Sq(m[1]) + ".";
    return w;
};
var drawL10Piece = function(p, x, y) {
    var t = abs(p); var w = p > 0;
    pushMatrix(); translate(x, y);
    noStroke();
    var f1 = w ? 245 : 40; var f2 = w ? 230 : 25; var ol = w ? 60 : 200;
    fill(ol); ellipse(0, 13, 28, 8);
    fill(f1); stroke(ol); strokeWeight(1.5);
    if (t === 1) { ellipse(0, -6, 11, 11); quad(-6, 0, 6, 0, 9, 11, -9, 11); }
    else if (t === 2) {
        beginShape(); vertex(-9, 12); vertex(9, 12); vertex(7, 0); vertex(9, -6); vertex(4, -13); vertex(-4, -12); vertex(-10, -4); vertex(-8, 1); vertex(-2, -2); vertex(-6, 6); endShape(CLOSE);
        noStroke(); fill(ol); ellipse(2, -7, 2.5, 2.5);
    } else if (t === 3) { ellipse(0, -2, 13, 20); rect(-9, 8, 18, 5, 2); noStroke(); fill(ol); ellipse(0, -14, 4, 4); stroke(ol); line(-2, -6, 3, -1); }
    else if (t === 4) { rect(-8, -6, 16, 18); rect(-10, -12, 20, 7); noStroke(); fill(f2); rect(-6, -12, 3, 3); rect(1, -12, 3, 3); }
    else if (t === 5) { quad(-9, 12, 9, 12, 6, -4, -6, -4); triangle(-10, -4, -6, -14, -3, -4); triangle(-3, -4, 0, -16, 3, -4); triangle(3, -4, 6, -14, 10, -4); }
    else { quad(-9, 12, 9, 12, 6, -4, -6, -4); rect(-6, -8, 12, 5, 1); noStroke(); fill(ol); rect(-1, -17, 2, 9); rect(-4, -14, 8, 2); }
    noStroke();
    popMatrix();
};
var L10_CX = 40;
var L10_CY = 40;
var L10_CS = 40;
var l10DoMove = function(from, to) {
    var b = l10.board;
    var died = b[to] !== 0;
    l10.board = l10Apply(b, from, to);
    l10.last = [from, to]; l10.sel = -1; l10.helpT = 0;
    if (died) {
        l10.dead.push(b[to]);
        l10.pts++; shake(4);
        burst(L10_CX + (to % 8) * L10_CS + 20, L10_CY + floor(to / 8) * L10_CS + 20, 255, 255, 255, 12, 2.5, 0.05);
        l10Say(l10.pts >= 5 ? "that's 5 points..." : "a piece died. +1 POINT (" + l10.pts + "/5)");
        if (l10.pts >= 5) { l10.over = 3; l10.overT = 0; return; }
    }
    l10.turn = -l10.turn; l10.aiT = 0;
    // did that end the game?
    var side = l10.turn;
    if (l10Moves(l10.board, side).length === 0) {
        var ks = l10.board.indexOf(6 * side);
        var mate = ks >= 0 && l10Attacked(l10.board, ks, -side);
        if (side === -1) { l10.over = mate ? 1 : 2; l10Say(mate ? "CHECKMATE!!! YOU BEAT THE AI!" : "stalemate..."); }
        else { l10.over = mate ? 4 : 2; }
        l10.overT = 0;
    }
};
var drawL10ChessRoom = function() {
    noStroke();
    var i;
    background(40, 30, 38);
    for (i = 0; i < 10; i++) { fill(48 + (i % 2) * 6, 34, 44); rect(i * 40, 0, 40, 400); }
    fill(0, 0, 0, 60); rect(0, 360, 400, 40);
    // the big wooden frame around the board
    fill(70, 45, 25); rect(30, 30, 340, 340, 6);
    fill(95, 62, 34); rect(33, 33, 334, 334, 5);
    for (i = 0; i < 8; i++) { fill(85, 55, 30); rect(36 + i * 42, 34, 26, 1); rect(36 + i * 42, 365, 26, 1); }
    // the AI: a little robot head, top right
    fill(150, 160, 175); rect(372, 4, 24, 20, 4); fill(120, 130, 145); rect(380, 0, 8, 4);
    var think = l10.turn === -1 && !l10.over;
    fill(think ? 255 : 80, think ? 80 : 220, think ? 80 : 255); ellipse(379, 13, 6, 6); ellipse(389, 13, 6, 6);
    fill(60); rect(379, 19, 10, 2);
    if (think) { fill(255, 255, 255, 150); textSize(8); textAlign(RIGHT); text("hmm" + "...".substring(0, (floor(frameCount / 15) % 3) + 1), 368, 14); }
    // the piece graveyards (the dead go here)
    if (l10.dead) {
        var nw = 0; var nb = 0;
        for (i = 0; i < l10.dead.length; i++) {
            var p = l10.dead[i];
            pushMatrix();
            if (p > 0) { translate(16, 60 + nw * 20); nw++; } else { translate(384, 60 + nb * 20); nb++; }
            scale(0.55); drawL10Piece(p, 0, 0); popMatrix();
        }
    }
};
var drawL10Chess = function() {
    drawL10ChessRoom();
    noStroke();
    var b = l10.board; var i;
    fill(255, 230, 120); textSize(13); textAlign(CENTER); text("LEVEL 10 PT 6: CHESS", 200, 18);
    fill(220, 210, 230); textSize(9); text("every time a piece DIES (yours OR theirs) you get 1 point.  5 points = you LOSE.", 200, 32);
    var legal = [];
    if (l10.sel >= 0) { var mv = l10Moves(b, 1); for (i = 0; i < mv.length; i++) { if (mv[i][0] === l10.sel) { legal.push(mv[i][1]); } } }
    var help = (cheatOn || l10.helpT > 0) ? l10.help : null;
    for (i = 0; i < 64; i++) {
        var x = L10_CX + (i % 8) * L10_CS; var y = L10_CY + floor(i / 8) * L10_CS;
        var light = ((i % 8) + floor(i / 8)) % 2 === 0;
        fill(light ? 236 : 120, light ? 218 : 150, light ? 180 : 96); rect(x, y, L10_CS, L10_CS);
        if (i === l10.last[0] || i === l10.last[1]) { fill(255, 230, 80, 90); rect(x, y, L10_CS, L10_CS); }
        if (i === l10.sel) { fill(80, 200, 255, 120); rect(x, y, L10_CS, L10_CS); }
        if (help && (i === help[0] || i === help[1])) { fill(120, 255, 120, 130); rect(x, y, L10_CS, L10_CS); }
        if (i % 8 === 0) { fill(light ? 70 : 255, light ? 100 : 245, light ? 50 : 220); textSize(11); textAlign(LEFT); text("" + (8 - floor(i / 8)), x + 2, y + 11); }
        if (i >= 56) { fill(light ? 70 : 255, light ? 100 : 245, light ? 50 : 220); textSize(11); textAlign(RIGHT); text("abcdefgh".charAt(i % 8), x + L10_CS - 2, y + L10_CS - 2); }
        if (b[i] !== 0) { drawL10Piece(b[i], x + L10_CS / 2, y + L10_CS / 2); }
        if (legal.indexOf(i) >= 0) { fill(40, 40, 40, 120); ellipse(x + L10_CS / 2, y + L10_CS / 2, b[i] !== 0 ? 34 : 12, b[i] !== 0 ? 34 : 12); }
    }
    if (l10.helpT > 0) { l10.helpT--; }
    noFill(); stroke(60, 40, 20); strokeWeight(3); rect(L10_CX, L10_CY, L10_CS * 8, L10_CS * 8); noStroke();
    // points (skulls)
    fill(0, 0, 0, 150); rect(40, 366, 320, 28, 6);
    fill(255); textSize(10); textAlign(LEFT); text("POINTS:", 50, 384);
    for (i = 0; i < 5; i++) {
        var sx = 110 + i * 26;
        fill(i < l10.pts ? 240 : 70); ellipse(sx, 378, 16, 14); rect(sx - 5, 382, 10, 5, 1);
        fill(i < l10.pts ? 30 : 50); ellipse(sx - 3, 377, 4, 4); ellipse(sx + 3, 377, 4, 4);
    }
    fill(255); textAlign(RIGHT);
    var ks = b.indexOf(6);
    var inCheck = ks >= 0 && l10Attacked(b, ks, -1);
    text(l10.over ? "" : (l10.turn === 1 ? (inCheck ? "CHECK! your move" : "your move") : "the AI is thinking..."), 352, 384);
    // the AI moves
    if (!l10.over && l10.turn === -1) {
        l10.aiT++;
        if (l10.aiT > 30) {
            var am = l10AiMove();
            if (am === null) {
                var bk = b.indexOf(-6);
                if (bk >= 0 && l10Attacked(b, bk, 1)) { l10.over = 1; l10Say("CHECKMATE!!! YOU BEAT THE AI!"); }
                else { l10.over = 2; l10Say("stalemate... nobody wins. (start over)"); }
            } else { l10DoMove(am[0], am[1]); }
        }
    }
    if (l10.over) {
        l10.overT++;
        fill(0, 0, 0, min(160, l10.overT * 4)); rect(0, 0, 400, 400);
        textAlign(CENTER); textSize(26);
        if (l10.over === 1) { fill(255, 230, 80); text("YOU WIN!", 200, 190); }
        else { fill(255, 90, 90); text(l10.over === 3 ? "5 POINTS... YOU LOSE!" : (l10.over === 4 ? "CHECKMATE. YOU LOSE!" : "STALEMATE!"), 200, 190); fill(255); textSize(11); text("(the game restarts)", 200, 214); }
        if (l10.overT > 130) {
            if (l10.over === 1) { l10.phase = 3; l10.t = 0; l10.cracks = []; l10.hits = 0; }
            else { l10ChessNew(); }
        }
    }
};
var l10ChessPressed = function() {
    if (l10.over || l10.turn !== 1) { return; }
    var c = floor((mouseX - L10_CX) / L10_CS); var r = floor((mouseY - L10_CY) / L10_CS);
    if (c < 0 || r < 0 || c > 7 || r > 7) { return; }
    var sq = r * 8 + c;
    if (l10.board[sq] > 0) { l10.sel = sq; return; }
    if (l10.sel < 0) { return; }
    var mv = l10Moves(l10.board, 1);
    for (var i = 0; i < mv.length; i++) {
        if (mv[i][0] === l10.sel && mv[i][1] === sq) { l10DoMove(l10.sel, sq); return; }
    }
    l10.sel = -1;
};
// ---------- PART 3: BREAKTIME ----------
var drawL10Break = function() {
    background(255);
    noStroke();
    fill(0); rect(0, 0, 400, 24); rect(0, 376, 400, 24); rect(0, 0, 24, 400); rect(376, 0, 24, 400);
    var sh = l10.hits > 0 ? random(-l10.hits * 0.08, l10.hits * 0.08) : 0;
    textAlign(CENTER); textSize(52); fill(0); text("BREAKTIME!", 200 + sh, 214);
    stroke(0); strokeWeight(1.5);
    for (var i = 0; i < l10.cracks.length; i++) {
        var C = l10.cracks[i];
        for (var k = 0; k + 1 < C.length; k++) { line(C[k][0], C[k][1], C[k + 1][0], C[k + 1][1]); }
    }
    noStroke();
    if (l10.breakT > 0) {
        l10.breakT++;
        background(255); fill(0); rect(0, 0, 400, 24); rect(0, 376, 400, 24); rect(0, 0, 24, 400); rect(376, 0, 24, 400);
        for (var p = 0; p < 4; p++) {
            fill(0); textSize(52 - p * 4);
            var px = 255 + p * 22 + l10.breakT * (p - 1.5) * 1.5; var py = 214 + l10.breakT * l10.breakT * 0.04 * (p + 1);
            text("TIME".charAt(p), px, py);
        }
        fill(0); textSize(52); text("BREAK", 152, 214);
        if (l10.breakT > 90) { l10.phase = 4; l10.t = 0; l10.built = 1; l10.frozen = 0; l10.plan = 0; l10.bp = 0; }
    }
};
var l10TimeX = function() {
    textSize(52);
    var w = textWidth("BREAKTIME!"); var wb = textWidth("BREAK"); var wt = textWidth("TIME");
    return [200 - w / 2 + wb, 200 - w / 2 + wb + wt];
};
var l10BreakPressed = function() {
    if (l10.breakT > 0) { return; }
    var tx = l10TimeX();
    if (mouseX > tx[0] && mouseX < tx[1] && mouseY > 170 && mouseY < 222) {
        l10.hits++; shake(2 + l10.hits * 0.2);
        var cr = [[mouseX, mouseY]]; var a = random(0, 360); var x = mouseX; var y = mouseY;
        for (var s = 0; s < 5; s++) { a += random(-50, 50); x += cos(a) * 12; y += sin(a) * 12; cr.push([x, y]); }
        l10.cracks.push(cr);
        if (l10.hits >= 30) { l10.breakT = 1; flash(0, 0, 0, 200); }
    }
};
// ---------- PART 4: TIME GOES BACKWARDS (and the blueprints) ----------
var L10_PLANS = ["A HOUSE", "A BIG TOWER", "A BANANA STAND", "A GIANT DOOR", "A PIZZA"];
var l10K = function(k, a, b) { return constrain((k - a) / (b - a), 0, 1); };
// one brick wall, built row by row from the bottom. holes = [[x, y, w, h], ...] stay open (windows + doors)
var drawL10Bricks = function(x0, x1, yb, rows, kw, holes, r1, g1, b1) {
    var bw = 20; var bh = 10;
    var total = rows * kw;
    for (var r = 0; r < rows; r++) {
        if (r >= total) { break; }
        var y = yb - (r + 1) * bh;
        var off = (r % 2) * (bw / 2);
        var nb = ceil((x1 - x0) / bw) + 1;
        var showN = (r + 1 <= total) ? nb : floor((total - r) * nb);
        for (var c = 0; c < nb && c < showN; c++) {
            var bx = x0 - off + c * bw;
            var L = max(bx, x0); var R = min(bx + bw, x1);
            if (R - L < 3) { continue; }
            var skip = false;
            for (var h = 0; h < holes.length; h++) {
                var H = holes[h];
                if (L < H[0] + H[2] && R > H[0] && y < H[1] + H[3] && y + bh > H[1]) { skip = true; }
            }
            if (skip) { continue; }
            var sh = ((r * 7 + c * 13) % 5) * 6;
            fill(r1 - sh, g1 - sh * 0.5, b1 - sh * 0.4); rect(L + 0.8, y + 0.8, R - L - 1.6, bh - 1.6, 1);
            fill(255, 255, 255, 25); rect(L + 1.5, y + 1.2, R - L - 3, 2);
        }
    }
};
var drawL10Scaffold = function(x0, x1, ytop) {
    stroke(150, 150, 160); strokeWeight(2.5);
    line(x0, 320, x0, ytop); line(x1, 320, x1, ytop);
    strokeWeight(1.2);
    for (var y = 320; y > ytop + 10; y -= 36) { line(x0, y, x1, y - 36); line(x1, y, x0, y - 36); }
    noStroke();
    for (var y2 = 296; y2 > ytop; y2 -= 36) { fill(170, 120, 60); rect(x0 - 3, y2, x1 - x0 + 6, 4, 1); }
};
var drawL10House = function(k, plan) {
    noStroke();
    var i;
    // the slab
    var kf0 = l10K(k, 0, 0.1);
    fill(165, 165, 168); rect(200 - 80 * kf0, 312, 160 * kf0, 9, 2);
    fill(140, 140, 145); rect(200 - 80 * kf0, 318, 160 * kf0, 3);
    if (plan === 3) {
        // ---- A GIANT DOOR ----
        var kp = l10K(k, 0.08, 0.45);
        fill(120, 120, 128); rect(146, 312 - 210 * kp, 22, 210 * kp, 2); rect(232, 312 - 210 * kp, 22, 210 * kp, 2);
        for (i = 0; i < 10; i++) { if (i < kp * 10) { fill(105, 105, 112); rect(146, 300 - i * 21, 22, 2); rect(232, 300 - i * 21, 22, 2); } }
        var ka = l10K(k, 0.45, 0.6);
        if (ka > 0) { fill(120, 120, 128); rect(146, 92, 108 * ka, 24, 3); fill(200, 180, 80); if (ka >= 1) { textSize(9); textAlign(CENTER); text("THE DOOR", 200, 108); } }
        var kd = l10K(k, 0.6, 0.85);
        for (i = 0; i < 6; i++) {
            if (i >= kd * 6) { break; }
            fill(95 + (i % 2) * 14, 58 + (i % 2) * 8, 28); rect(168 + i * 10.7, 116, 10.7, 196);
            fill(70, 42, 20); rect(168 + i * 10.7, 116, 1, 196);
        }
        if (k > 0.85) {
            fill(60, 60, 66); rect(168, 150, 64, 7); rect(168, 270, 64, 7);
            fill(90, 90, 96); ellipse(174, 153, 5, 5); ellipse(226, 153, 5, 5); ellipse(174, 273, 5, 5); ellipse(226, 273, 5, 5);
        }
        if (k > 0.95) { fill(230, 185, 60); ellipse(220, 214, 11, 11); fill(30); rect(218, 222, 4, 10, 1); }
        if (k < 0.97) { drawL10Scaffold(118, 140, 100); }
        return;
    }
    if (plan === 1) {
        // ---- A BIG TOWER ----
        drawL10Bricks(170, 230, 312, 22, l10K(k, 0.08, 0.8), [[192, 270, 16, 42], [194, 200, 12, 18], [194, 140, 12, 18]], 175, 160, 150);
        var kt = l10K(k, 0.8, 1);
        for (i = 0; i < 4; i++) { if (i < kt * 4) { fill(160, 145, 135); rect(166 + i * 19, 78, 12, 14); } }
        if (kt >= 1) { fill(150, 100, 60); rect(196, 40, 3, 40); fill(220, 60, 60); triangle(199, 40, 222, 48, 199, 56); }
        if (k < 0.97) { drawL10Scaffold(150, 162, 90); }
        return;
    }
    if (plan === 2) {
        // ---- A BANANA STAND ----
        var kc = l10K(k, 0.1, 0.5);
        fill(150, 100, 55); rect(150, 312 - 60 * kc, 100, 60 * kc, 3);
        if (kc >= 1) { fill(120, 80, 40); for (i = 0; i < 5; i++) { rect(152 + i * 20, 254, 2, 56); } }
        var kw = l10K(k, 0.5, 0.75);
        fill(120, 85, 45); rect(152, 252 - 90 * kw, 6, 90 * kw); rect(242, 252 - 90 * kw, 6, 90 * kw);
        var ko = l10K(k, 0.75, 0.9);
        for (i = 0; i < 6; i++) { if (i < ko * 6) { fill(i % 2 ? 255 : 250, i % 2 ? 255 : 220, i % 2 ? 255 : 60); triangle(140 + i * 20, 162, 160 + i * 20, 162, 150 + i * 20, 182); rect(140 + i * 20, 150, 20, 12); } }
        if (k > 0.9) {
            for (i = 0; i < 5; i++) { drawL10Banana(165 + i * 18, 254, i % 3 === 1 ? 0 : 2, 0.4, 0); }
            fill(255); textSize(10); textAlign(CENTER); text("BANANAS 5c", 200, 290);
        }
        return;
    }
    if (plan === 4) {
        // ---- A PIZZA ----
        var ks = l10K(k, 0.1, 0.9);
        for (i = 0; i < 8; i++) {
            if (i >= ks * 8) { break; }
            fill(220, 170, 90); arc(200, 220, 180, 180, i * 45, i * 45 + 45);
            fill(240, 200, 80); arc(200, 220, 160, 160, i * 45, i * 45 + 45);
            fill(200, 60, 40); var pa = i * 45 + 22; ellipse(200 + cos(pa) * 50, 220 + sin(pa) * 50, 16, 16); ellipse(200 + cos(pa + 12) * 26, 220 + sin(pa + 12) * 26, 12, 12);
        }
        fill(120, 80, 40); rect(196, 300, 8, 14);
        return;
    }
    // ---- A HOUSE ----
    var holes = [[146, 236, 30, 30], [224, 236, 30, 30], [186, 262, 28, 50]];
    var kw2 = l10K(k, 0.1, 0.57);
    drawL10Bricks(126, 274, 312, 10, kw2, holes, 190, 85, 60);
    // window + door frames show up once the walls pass them
    var top = 312 - 100 * kw2;
    fill(240, 240, 235);
    if (top < 266) { rect(144, max(top, 234), 34, 266 - max(top, 234) + 2); rect(222, max(top, 234), 34, 266 - max(top, 234) + 2); }
    if (k > 0.9) {
        fill(150, 210, 245); rect(147, 237, 28, 28); rect(225, 237, 28, 28);
        fill(240); rect(160, 237, 2, 28); rect(147, 250, 28, 2); rect(238, 237, 2, 28); rect(225, 250, 28, 2);
    } else if (top < 266) { fill(60, 50, 50); rect(147, max(top + 2, 237), 28, 265 - max(top + 2, 237)); rect(225, max(top + 2, 237), 28, 265 - max(top + 2, 237)); }
    if (top < 312) { fill(60, 50, 50); rect(187, max(top, 263), 26, 312 - max(top, 263)); }
    // the roof frame (wood)
    var kr = l10K(k, 0.57, 0.72);
    if (kr > 0) {
        stroke(170, 120, 60); strokeWeight(3);
        line(118, 212, 118 + 164 * kr, 212);
        for (i = 0; i < 5; i++) {
            if (i >= kr * 5) { break; }
            var tx = 126 + i * 37;
            var ty = 212 - 62 * (1 - abs(tx - 200) / 82);
            line(tx, 212, tx, ty);
        }
        if (kr >= 1) { line(118, 212, 200, 148); line(282, 212, 200, 148); }
        noStroke();
    }
    // roof tiles, row by row
    var kt2 = l10K(k, 0.72, 0.9);
    var trows = 8;
    for (var r = 0; r < trows; r++) {
        if (r >= kt2 * trows) { break; }
        var ry = 212 - (r + 1) * 8;
        var half = 82 * (1 - (r + 1) / (trows + 0.6)) + 8;
        for (var tt = -half; tt < half; tt += 12) {
            fill(150 - (r % 2) * 12, 50, 40); arc(200 + tt + 6 + (r % 2) * 6 - 6, ry + 4, 13, 14, 0, 180);
            fill(170 - (r % 2) * 12, 60, 45); rect(200 + tt + (r % 2) * 6 - 6, ry, 12, 5);
        }
    }
    if (k > 0.9) {
        fill(150, 70, 55); rect(240, 150, 16, 34); fill(110, 110, 115); rect(237, 146, 22, 6);
        fill(110, 70, 35); rect(187, 263, 26, 49, 2); fill(230, 185, 60); ellipse(208, 290, 5, 5);
        fill(80, 160, 70); ellipse(140, 312, 20, 12); ellipse(260, 312, 20, 12); fill(240, 90, 120); ellipse(136, 308, 5, 5); ellipse(264, 307, 5, 5);
    }
    if (k > 0.08 && k < 0.95) { drawL10Scaffold(104, 120, 170); }
};
var drawL10Worker = function(x, y, carrying, dir) {
    noStroke();
    var step = sin(frameCount * 14 + x) * 4;
    // legs + boots
    stroke(60, 70, 110); strokeWeight(4); line(x - 2, y - 14, x - 3 + step, y - 2); line(x + 2, y - 14, x + 3 - step, y - 2); noStroke();
    fill(70, 45, 25); ellipse(x - 3 + step + dir * 2, y - 1, 8, 4); ellipse(x + 3 - step + dir * 2, y - 1, 8, 4);
    // body: shirt + safety vest
    fill(90, 120, 170); rect(x - 7, y - 32, 14, 19, 3);
    fill(250, 150, 30); rect(x - 7, y - 31, 4, 17, 1); rect(x + 3, y - 31, 4, 17, 1);
    fill(230, 240, 230); rect(x - 7, y - 22, 14, 2);
    // arms
    stroke(240, 200, 160); strokeWeight(3);
    if (carrying) { line(x, y - 29, x + dir * 6, y - 36); } else { line(x - dir * 5, y - 28, x - dir * 6 + step * 0.5, y - 18); }
    noStroke();
    // head + hard hat
    fill(240, 200, 160); ellipse(x, y - 39, 12, 12);
    fill(30); ellipse(x + dir * 3, y - 39, 2, 2);
    fill(250, 210, 40); arc(x, y - 41, 15, 13, 180, 360); rect(x - 9, y - 42, 18, 2, 1);
    if (carrying) {
        fill(180, 75, 50); rect(x + dir * 4 - 8, y - 44, 16, 6, 1); rect(x + dir * 4 - 6, y - 49, 12, 5, 1);
    }
};
// the yard around the building: sky, crane, mixer, brick pile
var drawL10Yard = function(rewind, frozen, k, noCrane) {
    noStroke();
    if (frozen) { background(170, 190, 215); } else if (rewind) { background(140, 170, 225); } else { background(150, 205, 245); }
    // clouds (they drift BACKWARDS when time does)
    var cx = rewind && !frozen ? -l10.t * 0.6 : (frozen ? 0 : frameCount * 0.3);
    fill(255, 255, 255, 200);
    for (var c = 0; c < 3; c++) { var x = ((c * 160 + cx) % 520 + 520) % 520 - 60; ellipse(x, 60 + c * 22, 70, 22); ellipse(x + 20, 52 + c * 22, 40, 20); }
    // hills + ground
    fill(120, 175, 100); ellipse(80, 330, 300, 90); ellipse(330, 335, 320, 80);
    fill(110, 170, 90); rect(0, 320, 400, 80);
    fill(165, 140, 100); rect(0, 314, 400, 8);
    if (!noCrane) {
    // the crane
    fill(240, 190, 40);
    rect(326, 70, 10, 250);
    for (var s = 0; s < 12; s++) { stroke(200, 150, 30); strokeWeight(1.5); line(326, 320 - s * 21, 336, 299 - s * 21); noStroke(); }
    fill(240, 190, 40); rect(160, 64, 220, 8); rect(326, 58, 30, 12);
    fill(100, 100, 110); rect(350, 72, 22, 16);
    var hk = 200 + sin((frozen ? 0 : (rewind ? -l10.t : frameCount)) * 2) * 40;
    stroke(60); strokeWeight(1); line(230, 72, 230, hk); noStroke();
    fill(80); rect(226, hk, 8, 6);
    if (k < 1) { fill(150, 110, 60); rect(212, hk + 6, 36, 4); fill(180, 75, 50); rect(214, hk - 2, 14, 8, 1); rect(230, hk - 2, 14, 8, 1); }
    }
    // cement mixer
    fill(90, 90, 100); rect(352, 300, 40, 6); fill(80); ellipse(358, 310, 10, 10); ellipse(386, 310, 10, 10);
    fill(230, 120, 40); pushMatrix(); translate(372, 288); rotate(frozen ? -20 : (rewind ? 20 - frameCount * 4 : frameCount * 4)); ellipse(0, 0, 34, 26); fill(200, 100, 30); rect(-14, -2, 28, 4); popMatrix();
    // brick pile: gets BIGGER as the house comes apart
    var pile = floor((1 - k) * 12) + 2;
    for (var p = 0; p < pile; p++) {
        var row = floor(p / 4);
        fill(180 - (p % 3) * 10, 75, 50); rect(290 + (p % 4) * 15 - row * 4 + row * 2, 306 - row * 7, 14, 6, 1);
    }
};
var l10MakeSite = function() {
    l10.junk = [];
    for (var i = 0; i < 90; i++) { l10.junk.push([random(30, 370), random(330, 392), floor(random(0, 4)), random(0, 360)]); }
    l10.keyX = random(40, 360); l10.keyY = random(334, 390);
    l10.lens = 0; l10.lunch = 0; l10.siteKey = 0; l10.triedDoor = 0;
};
// ---- the BREAKTIME! sign gets UN-BUILT (time is going backwards) ----
// the sign: white board nailed on, black border soldered on, letters screwed on, all on a wooden frame
var L10_SX = 50;
var L10_SY = 90;
var L10_SW = 300;
var L10_SH = 200;
var L10_UT = [60, 100, 140, 250, 330, 510, 690, 880];   // un-break, zoom out, ladders, hammer, carry, solder, screws, frame -> FREEZE
var l10Ease = function(a) { a = constrain(a, 0, 1); return a * a * (3 - 2 * a); };
// where a carried-off piece is: starts at (x, y), drops to the ground, then gets carried off to the right
var l10Off = function(t, t0, x, y) {
    var a = (t - t0) / 50;
    if (a <= 0) { return [x, y, 0]; }
    var down = l10Ease(min(1, a * 2));
    var away = l10Ease(max(0, a * 2 - 1) / 1.5);
    return [x + away * 420, y + (300 - y) * down, a];
};
var drawL10Ladder = function(x, ytop) {
    stroke(170, 120, 60); strokeWeight(3);
    line(x - 9, 330, x - 5, ytop); line(x + 9, 330, x + 5, ytop);
    strokeWeight(2);
    for (var y = 320; y > ytop + 4; y -= 14) { var f = (330 - y) / (330 - ytop); line(x - 9 + 4 * f, y, x + 9 - 4 * f, y); }
    noStroke();
};
var drawL10Lift = function(x, ytop) {
    // a yellow scissor lift
    fill(60); ellipse(x - 18, 330, 10, 10); ellipse(x + 18, 330, 10, 10);
    fill(240, 190, 40); rect(x - 24, 316, 48, 10, 2);
    stroke(220, 160, 30); strokeWeight(2.5);
    var n = 4; var h = (316 - ytop) / n;
    for (var i = 0; i < n; i++) { line(x - 18, 316 - i * h, x + 18, 316 - (i + 1) * h); line(x + 18, 316 - i * h, x - 18, 316 - (i + 1) * h); }
    noStroke();
    fill(240, 190, 40); rect(x - 22, ytop - 4, 44, 6, 2);
    stroke(200, 150, 30); strokeWeight(1.5); line(x - 22, ytop - 4, x - 22, ytop - 18); line(x + 22, ytop - 4, x + 22, ytop - 18); line(x - 22, ytop - 18, x + 22, ytop - 18); noStroke();
};
// a worker holding a tool. tool: 1 hammer, 2 soldering iron, 3 screwdriver
var drawL10Tooler = function(x, y, tool, dir) {
    drawL10Worker(x, y, false, dir);
    var sx = x + dir * 4; var sy = y - 30;
    var a;
    if (tool === 1) { a = -60 + abs(sin(frameCount * 18)) * 100; }
    else if (tool === 2) { a = -20 + sin(frameCount * 6) * 6; }
    else { a = -10; }
    pushMatrix(); translate(sx, sy); scale(dir, 1); rotate(a);
    stroke(240, 200, 160); strokeWeight(3); line(0, 0, 9, 0); noStroke();
    if (tool === 1) { fill(130, 85, 40); rect(8, -1.5, 14, 3); fill(120, 120, 130); rect(20, -5, 6, 10, 1); }
    else if (tool === 2) {
        fill(40, 120, 200); rect(7, -2, 8, 4, 1); fill(160); rect(15, -1, 12, 2);
        fill(255, 140 + random(0, 80), 40); ellipse(28, 0, 4, 4);
    } else {
        pushMatrix(); translate(12, 0); fill(220, 50, 50); rect(-4, -3, 8, 6, 2); fill(255, 255, 255, 150); rect(-4 + (frameCount % 4) * 2, -3, 1, 6); popMatrix();
        fill(170); rect(16, -0.8, 12, 1.6);
    }
    popMatrix();
};
var drawL10Sign = function(t) {
    var x0 = L10_SX; var y0 = L10_SY; var w = L10_SW; var h = L10_SH;
    var i; var P;
    // ---- the wooden frame (last to go) ----
    var pieces = [[x0 + 4, y0 + 4, w - 8, 8], [x0 + 4, y0 + 70, w - 8, 7], [x0 + 4, y0 + 130, w - 8, 7], [x0 + 4, y0 + h - 12, w - 8, 8],
                  [x0 + 4, y0 + 4, 8, h - 8], [x0 + w - 12, y0 + 4, 8, h - 8], [x0 + 40, y0 + h - 4, 8, 34], [x0 + w - 48, y0 + h - 4, 8, 34]];
    for (i = 0; i < pieces.length; i++) {
        var F = pieces[i];
        P = l10Off(t, L10_UT[6] + 10 + i * 16, F[0], F[1]);
        if (P[2] >= 1.25) { continue; }
        fill(185, 135, 75); rect(P[0], P[1], F[2], F[3], 1);
        fill(150, 105, 55); rect(P[0], P[1] + F[3] - 2, F[2], 2);
    }
    // ---- the white background (nailed on) ----
    if (t < L10_UT[3] + 80) {
        var wp = l10Off(t, L10_UT[3], x0, y0);
        // once it's off, they tip it flat to carry it
        var flat = constrain((t - L10_UT[3]) / 10, 0, 1);
        var wh = h - (h - 12) * flat;
        fill(255); rect(wp[0], wp[1] + (h - wh) * 0.5 * (1 - flat), w, wh);
        if (flat > 0) { fill(220); rect(wp[0], wp[1] + wh - 3, w, 3); }
        // nails (they pop OUT while time goes backwards)
        for (i = 0; i < 8; i++) {
            var nx = x0 + 20 + (i % 4) * 86.7; var ny = i < 4 ? y0 + 18 : y0 + h - 18;
            var pop = L10_UT[2] + 8 + i * 12;
            if (t < pop) { fill(110); ellipse(nx, ny, 5, 5); }
            else if (t < pop + 30) { var pa = (t - pop) / 30; fill(140); rect(nx + pa * (i % 2 ? 40 : -40), ny - pa * 30 + pa * pa * 90, 2, 7); }
        }
    }
    // ---- the black border (soldered on). 4 strips: top, right, bottom, left ----
    var strips = [[x0, y0, w, 12], [x0 + w - 12, y0, 12, h], [x0, y0 + h - 12, w, 12], [x0, y0, 12, h]];
    for (i = 0; i < 4; i++) {
        var st = L10_UT[4] + 20 + i * 40;
        P = l10Off(t, st + 22, strips[i][0], strips[i][1]);
        if (P[2] >= 1.25) { continue; }
        fill(15); rect(P[0], P[1], strips[i][2], strips[i][3]);
        // solder blobs
        if (t < st + 22) { fill(170, 170, 180); for (var bb = 0; bb < 3; bb++) { ellipse(strips[i][0] + strips[i][2] * (0.2 + bb * 0.3), strips[i][1] + strips[i][3] / 2, 5, 5); } }
    }
    // ---- the letters (screwed on) ----
    textSize(40); textAlign(LEFT);
    var word = "BREAKTIME!";
    var tw = textWidth(word); var lx = 200 - tw / 2;
    for (i = 0; i < word.length; i++) {
        var ch = word.charAt(i);
        var cx = lx + textWidth(word.substring(0, i));
        var lt = L10_UT[5] + 14 + i * 16;
        var dx = 0; var dy = 0; var gone = false;
        if (t > lt) {
            var la = min(1, (t - lt) / 30);
            if (la >= 1) { gone = true; }
            dx = (372 - cx) * la; dy = (300 - 208) * la - sin(la * 180) * 60;
        }
        if (gone) { continue; }
        fill(0); textSize(40); text(ch, cx + dx, 206 + dy);
        if (t <= lt) { fill(150); ellipse(cx + textWidth(ch) / 2, 176, 4, 4); }
    }
    textAlign(CENTER);
};
var drawL10Unbuild = function() {
    var t = l10.t; var U = L10_UT;
    var i;
    if (t < U[0]) {
        // first: the break UN-happens. the T-I-M-E letters fly back + the cracks heal
        background(255);
        fill(0); rect(0, 0, 400, 24); rect(0, 376, 400, 24); rect(0, 0, 24, 400); rect(376, 0, 24, 400);
        var back = 1 - t / U[0];
        fill(0); textSize(52); textAlign(CENTER); text("BREAK", 152, 214);
        for (var p = 0; p < 4; p++) {
            var bt = back * 90;
            textSize(52 - p * 4); text("TIME".charAt(p), 255 + p * 22 + bt * (p - 1.5) * 1.5, 214 + bt * bt * 0.04 * (p + 1));
        }
        fill(80, 120, 255, 40); rect(0, 0, 400, 400);
        return;
    }
    // zoom out from the sign to see the whole lot
    var z = 1 + (1 - l10Ease((t - U[0]) / (U[1] - U[0]))) * 0.333;
    drawL10Yard(true, false, 1, true);
    pushMatrix();
    translate(200, 190); scale(z); translate(-200, -190);
    // ladders (gone once the frame comes down)
    if (t > U[1] && t < U[6]) { drawL10Ladder(36, 120); drawL10Ladder(364, 120); }
    drawL10Sign(t);
    popMatrix();
    if (t < U[1]) { fill(255, 255, 255, 255 * (1 - (t - U[0]) / (U[1] - U[0]))); rect(0, 0, 400, 400); }
    // ---- workers ----
    if (t >= U[1] && t < U[3]) {
        // climb up the ladders, then BONK BONK BONK
        var cl = l10Ease((t - U[1]) / (U[2] - U[1]));
        var wy = 336 - cl * 196;
        if (t < U[2]) { drawL10Worker(36, wy, false, 1); drawL10Worker(364, wy, false, -1); }
        else {
            drawL10Tooler(36, wy, 1, 1); drawL10Tooler(364, wy, 1, -1);
            if (frameCount % 16 < 6) { fill(255, 240, 120); textSize(12); textAlign(CENTER); text("BONK!", 70, 120); text("BONK!", 330, 120); }
        }
    }
    if (t >= U[3] && t < U[4] + 10) {
        // two workers carry the white board away
        var cp = l10Off(t, U[3], L10_SX, L10_SY);
        drawL10Worker(cp[0] + 60, 336, true, 1); drawL10Worker(cp[0] + 240, 336, true, 1);
    }
    if (t >= U[4] && t < U[5]) {
        // the soldering guy rides the lift along each black strip
        var k = floor((t - U[4] - 20) / 40); var kk = constrain((t - U[4] - 20 - k * 40) / 22, 0, 1);
        var targets = [[60 + kk * 280, 100], [340, 100 + kk * 180], [340 - kk * 280, 290], [60, 290 - kk * 180]];
        var T = k < 0 ? [60, 100] : targets[min(3, k)];
        var ly = constrain(T[1] + 46, 150, 316);
        drawL10Lift(T[0] - 20, ly);
        drawL10Tooler(T[0] - 20, ly - 2, 2, 1);
        if (k >= 0 && k < 4 && kk < 1) {
            for (i = 0; i < 3; i++) { fill(255, 200 + random(0, 55), 60); ellipse(T[0] + random(-6, 6), T[1] + random(-6, 6), 3, 3); }
            fill(200, 200, 210, 120); ellipse(T[0] + 4, T[1] - 14 - (frameCount % 20), 10, 10);
            fill(255, 255, 255); textSize(10); textAlign(CENTER); text("tssss", T[0], T[1] - 26);
        }
    }
    if (t >= U[5] && t < U[6]) {
        // the screwdriver guy rides the lift to each letter. letters go in the crate
        var li = constrain(floor((t - U[5] - 14) / 16), 0, 9);
        textSize(40);
        var lx = 200 - textWidth("BREAKTIME!") / 2 + textWidth("BREAKTIME!".substring(0, li)) + textWidth("BREAKTIME!".charAt(li)) / 2;
        drawL10Lift(lx - 18, 214);
        drawL10Tooler(lx - 18, 212, 3, 1);
        fill(150, 105, 55); rect(352, 300, 44, 30, 2); fill(120, 80, 40); rect(352, 312, 44, 3);
        fill(255); textSize(7); textAlign(CENTER); text("LETTERS", 374, 326);
    }
    if (t >= U[6]) {
        // everybody takes the wooden frame down + carries it off
        for (i = 0; i < 3; i++) { drawL10Worker(120 + i * 80 + sin(frameCount * 3 + i * 50) * 10, 336 + (i % 2) * 8, i !== 1, 1); }
    }
    // the speech
    if (t === U[1] + 5) { l10Say("time is going BACKWARDS... the workers are UN-building the sign!"); }
    if (t === U[2] + 2) { l10Say("*BONK BONK* they're UN-nailing the white background!"); }
    if (t === U[3] + 2) { l10Say("they carry the white background away..."); }
    if (t === U[4] + 20) { l10Say("*tssss* UN-soldering the black border..."); }
    if (t === U[5] + 14) { l10Say("*squeak squeak* UN-screwing the letters..."); }
    if (t === U[6] + 10) { l10Say("now they take down the wooden frame..."); }
};
// after a WRONG plan gets built, time runs backwards and they take it apart again
var drawL10Undo = function() {
    l10.undoT++;
    var k = 1 - l10.undoT / 120;
    drawL10Yard(true, false, max(0, k));
    if (k > 0) { drawL10House(k, l10.plan); }
    for (var w = 0; w < 3; w++) { drawL10Worker(330 - ((l10.undoT * 1.5 + w * 110) % 300), 336 + (w % 2) * 8, w !== 1, 1); }
    fill(80, 120, 255, 30); rect(0, 0, 400, 400);
    if (l10.undoT >= 120) { l10.undo = 0; l10.building = 0; l10.frozen = 1; l10.plan = 0; flash(255, 255, 255, 120); l10Say("*FREEZE* ...time stopped again. try a different plan."); }
};
var drawL10Rewind = function() {
    l10.t++;
    var i;
    if (l10.undo) { drawL10Undo(); }
    else if (l10.building) {
        l10.buildT++;
        var bk = min(1, l10.buildT / 200);
        drawL10Yard(false, false, bk);
        drawL10House(bk, l10.plan);
        for (var w = 0; w < 4; w++) { drawL10Worker(40 + ((frameCount * 1.2 + w * 100) % 320), 336 + (w % 2) * 10, w % 2 === 0, 1); }
        if (l10.buildT === 200) {
            if (l10.plan === 3) { l10Say("they built a GIANT DOOR. (it's locked, of course)"); }
            else { l10Say("they built " + L10_PLANS[l10.plan] + "! ...but time rewinds again."); }
        }
        if (l10.buildT > 260) {
            if (l10.plan === 3) { l10.phase = 5; l10.t = 0; l10MakeSite(); return; }
            l10.undo = 1; l10.undoT = 0;
        }
    } else if (!l10.frozen) {
        drawL10Unbuild();
        if (l10.t >= L10_UT[7]) { l10.frozen = 1; flash(255, 255, 255, 140); l10Say("*FREEZE*  time stopped."); }
    } else {
        drawL10Yard(false, true, 1, true);
        for (i = 0; i < 4; i++) { drawL10Worker(120 + i * 70, 336 + (i % 2) * 10, false, 1); }
        fill(255, 255, 255, 40); rect(0, 0, 400, 400);
    }
    if (!l10.frozen && !l10.building && l10.t >= L10_UT[0]) {
        fill(80, 120, 255, 30); rect(0, 0, 400, 400);
        for (var vl = 0; vl < 4; vl++) { fill(255, 255, 255, 40); rect(0, (l10.t * 7 + vl * 113) % 400, 400, 3); }
    }
    if (l10.t < L10_UT[1] && !l10.frozen && !l10.building) { return; }
    // the clock
    var still = l10.frozen && !l10.building;
    fill(255); ellipse(54, 50, 60, 60); fill(40); ellipse(54, 50, 6, 6);
    var ca = still ? 0 : (l10.building ? frameCount * 6 : -frameCount * 6);
    stroke(40); strokeWeight(3); line(54, 50, 54 + cos(ca - 90) * 22, 50 + sin(ca - 90) * 22); strokeWeight(2); line(54, 50, 54 + cos(ca / 12 - 90) * 14, 50 + sin(ca / 12 - 90) * 14); noStroke();
    fill(40); textSize(10); textAlign(CENTER);
    textAlign(LEFT); text(l10.building && !l10.undo ? "time: FORWARD" : (still ? "time: FROZEN" : "time: BACKWARDS"), 90, 40); textAlign(CENTER);
    if (!still && !(l10.building && !l10.undo)) { fill(255, 255, 255, 120 + sin(frameCount * 10) * 100); textSize(16); text("<< << REWINDING << <<", 250, 74); }
    // the blueprint table (front, bottom left)
    fill(120, 80, 40); rect(10, 352, 84, 8, 2); rect(16, 360, 6, 30); rect(82, 360, 6, 30);
    fill(60, 110, 200); rect(18, 338, 68, 16, 2);
    fill(220, 235, 255); textSize(7); text("BLUEPRINTS", 52, 349);
    // the blueprint panel
    if (l10.bp) {
        fill(0, 0, 0, 150); rect(0, 0, 400, 400);
        fill(40, 80, 170); rect(50, 60, 300, 240, 6);
        stroke(150, 200, 255, 100); strokeWeight(1);
        for (var g = 60; g < 300; g += 20) { line(50, g, 350, g); } for (var g2 = 50; g2 < 350; g2 += 20) { line(g2, 60, g2, 300); }
        noStroke();
        fill(220, 235, 255); textSize(14); text("THE PLAN:", 200, 90);
        textSize(22); text(L10_PLANS[l10.plan], 200, 160);
        fill(255, 255, 255, 200); textSize(26); text("<", 80, 166); text(">", 320, 166);
        fill(240, 200, 60); rect(140, 230, 120, 30, 6);
        fill(40, 30, 10); textSize(12); text("BUILD THIS!", 200, 250);
        fill(180, 210, 255); textSize(9); text("(click outside to close)", 200, 290);
    }
};
var l10RewindPressed = function() {
    if (l10.bp) {
        if (mouseX < 50 || mouseX > 350 || mouseY < 60 || mouseY > 300) { l10.bp = 0; return; }
        if (mouseX < 110 && abs(mouseY - 160) < 30) { l10.plan = (l10.plan + L10_PLANS.length - 1) % L10_PLANS.length; return; }
        if (mouseX > 290 && abs(mouseY - 160) < 30) { l10.plan = (l10.plan + 1) % L10_PLANS.length; return; }
        if (mouseX > 140 && mouseX < 260 && mouseY > 230 && mouseY < 260) {
            l10.bp = 0; l10.building = 1; l10.buildT = 0;
            l10Say("the workers start building " + L10_PLANS[l10.plan] + "!");
        }
        return;
    }
    if (mouseX > 10 && mouseX < 94 && mouseY > 330 && mouseY < 362) {
        if (l10.frozen && !l10.building) { l10.bp = 1; } else { l10Say("the blueprints are rolling backwards too fast to read!"); }
    }
};
// ---------- PART 5: THE CONSTRUCTION SITE (find the key) ----------
var drawL10Junk = function(x, y, k, a, s) {
    pushMatrix(); translate(x, y); scale(s); rotate(a);
    noStroke();
    if (k === 0) { fill(130, 125, 120); ellipse(0, 0, 5, 4); }
    else if (k === 1) { fill(150, 150, 160); rect(-3, -0.6, 6, 1.2); fill(170); rect(-3.5, -1, 1.5, 2); }
    else if (k === 2) { fill(110, 100, 90); ellipse(0, 0, 3, 3); }
    else { fill(160, 140, 110); rect(-2, -1, 4, 2); }
    popMatrix();
};
var drawL10TinyKey = function(x, y, s) {
    pushMatrix(); translate(x, y); scale(s);
    noStroke(); fill(150, 150, 158); ellipse(-2, 0, 3, 3); rect(-1, -0.5, 4, 1);
    if (s > 1.5) { fill(90); ellipse(-2, 0, 1, 1); rect(2.2, 0.4, 0.8, 1.2); rect(1.2, 0.4, 0.6, 0.9); }
    popMatrix();
};
var l10MakeShed = function() {
    l10.parts = []; l10.given = [0, 0, 0, 0]; l10.held = -1; l10.tested = -1; l10.machineT = 0;
    for (var t = 0; t < 4; t++) {
        var good = floor(random(0, 4));
        for (var k = 0; k < 4; k++) { l10.parts.push({t: t, ok: k === good ? 1 : 0, gone: 0, x: 40 + k * 46, y: 90 + t * 52}); }
    }
};
var drawL10SiteBack = function() {
    noStroke();
    var i;
    background(150, 200, 240);
    fill(255, 255, 255, 200); ellipse(80, 50, 90, 26); ellipse(110, 42, 50, 22); ellipse(300, 70, 80, 22);
    // the city far away
    for (i = 0; i < 12; i++) {
        var bh = 40 + (i * 37) % 70;
        fill(160, 180, 205); rect(i * 34, 300 - bh, 30, bh);
        fill(190, 210, 230); for (var w = 0; w < bh / 12 - 1; w++) { rect(i * 34 + 5, 306 - bh + w * 12, 6, 5); rect(i * 34 + 18, 306 - bh + w * 12, 6, 5); }
    }
    fill(120, 170, 90); rect(0, 296, 400, 104);
    // chain-link fence
    stroke(150, 155, 160, 160); strokeWeight(1);
    for (var f = 0; f < 400; f += 8) { line(f, 262, f + 8, 300); line(f + 8, 262, f, 300); }
    strokeWeight(3); for (var fp = 0; fp < 400; fp += 64) { line(fp, 258, fp, 302); } line(0, 262, 400, 262);
    noStroke();
    // dirt with tire tracks + pebbles
    fill(170, 150, 110); rect(0, 318, 400, 82);
    fill(150, 130, 95); for (i = 0; i < 20; i++) { rect(i * 20, 360, 12, 3); rect(i * 20 + 6, 376, 12, 3); }
    for (i = 0; i < 25; i++) { fill(140 + (i % 3) * 10, 125, 95); ellipse((i * 59) % 400, 326 + (i * 23) % 70, 4, 3); }
    // sand pile + wheelbarrow + port-a-potty
    fill(220, 190, 120); arc(140, 320, 60, 40, 180, 360); fill(235, 205, 140); arc(136, 320, 30, 24, 200, 330);
    fill(60, 120, 200); rect(358, 232, 36, 86, 4); fill(40, 90, 160); rect(356, 228, 40, 8, 3);
    fill(255); textSize(6); textAlign(CENTER); text("PORTA", 376, 262); text("POTTY", 376, 270); fill(80, 200, 80); rect(386, 280, 5, 3);
    // the shed (left): planks, window, shingles, padlock
    fill(140, 100, 60); rect(20, 200, 100, 114);
    for (i = 0; i < 6; i++) { fill(125, 88, 50); rect(20 + i * 17, 200, 1, 114); }
    for (i = 0; i < 5; i++) { fill(100 - (i % 2) * 10, 60, 35); triangle(10 + i * 6, 204 - i * 9, 130 - i * 6, 204 - i * 9, 70, 160); }
    fill(110, 70, 40); triangle(10, 204, 130, 204, 70, 160);
    for (i = 0; i < 4; i++) { stroke(90, 55, 30); strokeWeight(1); line(22 + i * 9, 202 - i * 10, 118 - i * 9, 202 - i * 10); noStroke(); }
    fill(200, 230, 250); rect(28, 218, 18, 16); fill(140, 100, 60); rect(36, 218, 2, 16); rect(28, 225, 18, 2);
    fill(80, 50, 30); rect(52, 250, 36, 64, 3); fill(70, 42, 25); rect(55, 253, 30, 28, 2); rect(55, 284, 30, 27, 2);
    fill(255, 240, 200); textSize(9); textAlign(CENTER); text("SHED", 70, 196);
    if (!l10.shedOpen) { fill(160); rect(76, 270, 10, 12, 2); noFill(); stroke(160); strokeWeight(2); arc(81, 270, 8, 10, 180, 360); noStroke(); }
    // the giant door they built (same as the blueprint)
    drawL10House(1, 3);
    // a bird sitting on top of it
    fill(90, 70, 60); ellipse(220, 88, 12, 9); ellipse(226, 84, 7, 7); fill(240, 160, 40); triangle(229, 84, 233, 85, 229, 86);
};
var drawL10Site = function() {
    noStroke();
    drawL10SiteBack();
    if (l10.phase === 7) {
        l10.t++;
        var op = min(1, l10.t / 60);
        fill(255, 250, 220); rect(168, 116, 64 * op, 196);
        for (var ray = 0; ray < 7; ray++) { fill(255, 245, 200, 40 * op); triangle(200, 214, 200 + cos(ray * 30 + 90) * 400 - 200 + 200, 214 + sin(ray * 30 + 90) * 400, 200 + cos(ray * 30 + 100) * 400, 214 + sin(ray * 30 + 100) * 400); }
        fill(110, 70, 35); quad(168, 116, 168 - 34 * op, 106, 168 - 34 * op, 322, 168, 312);
        if (l10.t > 60) {
            fill(0, 0, 0, min(220, (l10.t - 60) * 4)); rect(0, 0, 400, 400);
            var msg = "Y O U   U N L O C K   T H E   D O O R . . .";
            var n = min(msg.length, floor((l10.t - 80) / 3));
            fill(255, 230, 120); textSize(17); textAlign(CENTER); if (n > 0) { text(msg.substring(0, n), 200, 200); }
            if (l10.t > 340) { l10.phase = 8; l10.t = 0; l10.dg = null; }
        }
        return;
    }
    // the break table + lunchbox
    fill(200, 200, 205); rect(290, 270, 90, 8, 2); rect(296, 278, 4, 36); rect(370, 278, 4, 36);
    fill(220, 60, 50); rect(310, 252, 40, 18, 3); fill(240, 240, 240); rect(310, 258, 40, 3);
    if (l10.lunch) { fill(250, 240, 200); rect(312, 244, 36, 10, 2); }
    // a sleeping worker
    drawL10Worker(270, 314, false, 1);
    fill(255); textSize(9); text("z z z", 284, 270 - (frameCount % 30) / 4);
    // cones + bricks
    fill(250, 120, 30); triangle(290, 316, 306, 316, 298, 292); fill(255); rect(293, 306, 10, 2);
    for (var bb = 0; bb < 6; bb++) { fill(180, 70, 50); rect(330 + (bb % 3) * 15, 304 - floor(bb / 3) * 7, 14, 6, 1); }
    // all the little junk on the ground (somewhere in there is a TINY key)
    for (var j = 0; j < l10.junk.length; j++) { var J = l10.junk[j]; drawL10Junk(J[0], J[1], J[2], J[3], 1); }
    if (!l10.siteKey) { drawL10TinyKey(l10.keyX, l10.keyY, 1); }
    // the magnifying glass view
    if (l10.lens && !l10.siteKey) {
        var mx = mouseX; var my = mouseY; var Z = 3; var R = 44;
        fill(170, 150, 110); ellipse(mx, my, R * 2, R * 2);
        for (var q = 0; q < l10.junk.length; q++) {
            var Q = l10.junk[q];
            if (dist(Q[0], Q[1], mx, my) < R / Z) { drawL10Junk(mx + (Q[0] - mx) * Z, my + (Q[1] - my) * Z, Q[2], Q[3], Z); }
        }
        if (dist(l10.keyX, l10.keyY, mx, my) < R / Z) { drawL10TinyKey(mx + (l10.keyX - mx) * Z, my + (l10.keyY - my) * Z, Z); }
        noFill(); stroke(60, 60, 70); strokeWeight(5); ellipse(mx, my, R * 2, R * 2); strokeWeight(7); line(mx + 31, my + 31, mx + 52, my + 52); noStroke();
    }
};
var l10SitePressed = function() {
    if (l10.phase === 7) { return; }
    if (mouseX > 300 && mouseX < 360 && mouseY > 240 && mouseY < 272) {
        if (!l10.lunch) { l10.lunch = 1; l10.lens = 1; l10Say("the lunchbox has a sandwich... and a MAGNIFYING GLASS! (you take it)"); }
        else { l10Say("just a sandwich left. (it's tuna. gross)"); }
        return;
    }
    if (!l10.siteKey && dist(mouseX, mouseY, l10.keyX, l10.keyY) < 7) { l10.siteKey = 1; flash(255, 255, 200, 80); l10Say("you found a TINY KEY!"); return; }
    if (mouseX > 146 && mouseX < 254 && mouseY > 92 && mouseY < 314) {
        if (l10.realKey) { l10.phase = 7; l10.t = 0; flash(255, 250, 220, 160); shake(6); return; }
        if (l10.siteKey) { l10.triedDoor = 1; shake(3); l10Say("it doesn't fit!! ...there's a tag on it: \"SHED\""); }
        else { l10Say("locked. it's a really big lock."); }
        return;
    }
    if (mouseX > 20 && mouseX < 120 && mouseY > 160 && mouseY < 314) {
        if (l10.shedOpen || l10.siteKey) { l10.shedOpen = 1; l10.phase = 6; l10.t = 0; if (!l10.parts) { l10MakeShed(); } return; }
        l10Say("the shed is locked with a little padlock.");
        return;
    }
    if (dist(mouseX, mouseY, 270, 290) < 20) { l10Say("zzz... \"five more minutes...\""); }
};
// ---------- PART 6: THE SHED (give Gus WORKING parts) ----------
var L10_PARTS = ["GEAR", "SPRING", "BATTERY", "BULB"];
var drawL10Part = function(P, x, y, s) {
    pushMatrix(); translate(x, y); scale(s);
    noStroke();
    if (P.t === 0) {
        fill(150, 150, 160);
        for (var g = 0; g < 8; g++) { if (!P.ok && g === 3) { continue; } var a = g * 45; pushMatrix(); rotate(a); rect(-3, -14, 6, 6); popMatrix(); }
        ellipse(0, 0, 22, 22); fill(60); ellipse(0, 0, 7, 7);
    } else if (P.t === 1) {
        noFill(); stroke(180, 180, 190); strokeWeight(2);
        var gap = P.ok ? 4 : 7;
        for (var c = 0; c < 5; c++) { ellipse(0, -10 + c * gap, 16, 5); }
        noStroke();
    } else if (P.t === 2) {
        fill(30); rect(-6, -12, 12, 24, 2); fill(P.ok ? 220 : 120, P.ok ? 160 : 110, 40); rect(-6, -12, 12, 8, 2); fill(190); rect(-2, -15, 4, 3);
        if (!P.ok) { fill(140, 200, 80, 180); ellipse(4, 12, 6, 3); }
    } else {
        fill(255, 255, 230, 200); ellipse(0, -4, 16, 18); fill(170); rect(-5, 4, 10, 8, 1);
        stroke(120); strokeWeight(1);
        if (P.ok) { line(-3, 0, -1, -6); line(-1, -6, 1, 0); line(1, 0, 3, -6); } else { line(-3, 0, -1, -6); line(2, -2, 3, -6); }
        noStroke();
    }
    popMatrix();
};
var drawL10ShedBack = function() {
    noStroke();
    var i;
    background(110, 80, 50);
    for (var p = 0; p < 10; p++) {
        fill(100 + (p % 2) * 12, 72, 44); rect(p * 40, 0, 38, 380);
        fill(90 + (p % 2) * 10, 64, 38); rect(p * 40 + 12, (p * 47) % 200, 1, 120); rect(p * 40 + 28, 150 + (p * 31) % 100, 1, 110);
    }
    // floor boards
    fill(90, 62, 36); rect(0, 370, 400, 30); for (i = 0; i < 8; i++) { fill(75, 52, 30); rect(i * 50, 370, 1, 30); }
    // the window + light coming in
    fill(170, 210, 240); rect(236, 12, 50, 38); fill(110, 80, 50); rect(260, 12, 2, 38); rect(236, 30, 50, 2);
    fill(255, 250, 210, 30); quad(236, 50, 286, 50, 320, 250, 250, 250);
    for (i = 0; i < 6; i++) { fill(255, 250, 220, 120); ellipse(262 + sin(frameCount * 2 + i * 60) * 20, 70 + ((frameCount * 0.4 + i * 30) % 160), 2, 2); }
    // the pegboard with tools
    fill(170, 140, 100); rect(298, 12, 92, 70, 3);
    fill(140, 110, 80); for (var hx = 0; hx < 9; hx++) { for (var hy = 0; hy < 7; hy++) { ellipse(304 + hx * 10, 18 + hy * 10, 2, 2); } }
    fill(130, 85, 40); rect(306, 22, 4, 30); fill(120); rect(302, 18, 12, 7, 1);                      // hammer
    fill(170); quad(322, 20, 352, 20, 352, 30, 322, 36); fill(200, 60, 40); rect(352, 18, 10, 14, 3); // saw
    fill(150); rect(370, 20, 4, 34); ellipse(372, 20, 10, 10); fill(170, 140, 100); ellipse(372, 18, 5, 5); // wrench
    fill(60, 60, 70); rect(322, 48, 30, 12, 2); fill(240, 190, 40); rect(326, 50, 8, 8);           // a drill
    // a hanging lamp
    stroke(40); strokeWeight(1); line(150, 0, 150, 18); noStroke();
    fill(255, 230, 150, 40); ellipse(150, 40, 120, 60);
    fill(70, 90, 70); arc(150, 26, 30, 20, 180, 360); fill(255, 240, 180); ellipse(150, 27, 10, 7);
    // a vise on the bench
    fill(90, 100, 120); rect(236, 280, 18, 10, 2); rect(232, 276, 4, 14); fill(150); rect(254, 284, 10, 2);
    // oil can + paint cans on the floor
    fill(180, 50, 50); rect(10, 348, 16, 22, 2); fill(200, 200, 60); rect(30, 352, 14, 18, 2); fill(150); rect(14, 346, 8, 3);
};
var drawL10GusExtras = function(gx, gy) {
    noStroke();
    // overall straps + pocket with a wrench
    fill(40, 70, 120); rect(gx - 14, gy, 5, 22); rect(gx + 9, gy, 5, 22); rect(gx - 12, gy + 20, 24, 18, 2);
    fill(220, 200, 60); ellipse(gx - 11, gy + 4, 4, 4); ellipse(gx + 11, gy + 4, 4, 4);
    fill(170); rect(gx + 4, gy + 14, 3, 12); ellipse(gx + 5.5, gy + 14, 6, 6);
    // a cap
    fill(200, 60, 50); arc(gx, gy - 24, 32, 22, 180, 360); rect(gx, gy - 26, 20, 4, 2);
    // beard
    fill(120, 85, 50); arc(gx, gy - 6, 24, 18, 0, 180);
};
var drawL10Shed = function() {
    noStroke();
    drawL10ShedBack();
    // shelves
    for (var s = 0; s < 4; s++) {
        fill(80, 55, 30); rect(24, 106 + s * 52, 196, 8);
        fill(255, 240, 200); textSize(8); textAlign(LEFT); text(["GEARS", "SPRINGS", "BATTERIES", "BULBS"][s], 26, 74 + s * 52);
    }
    for (var i = 0; i < l10.parts.length; i++) {
        var P = l10.parts[i];
        if (P.gone || i === l10.held) { continue; }
        drawL10Part(P, P.x, P.y, 1);
    }
    // the tester
    fill(60, 60, 70); rect(250, 240, 60, 40, 4);
    fill(l10.tested < 0 ? 80 : (l10.parts[l10.tested].ok ? 80 : 255), l10.tested < 0 ? 80 : (l10.parts[l10.tested].ok ? 255 : 60), 80); ellipse(296, 252, 12, 12);
    fill(220); textSize(7); textAlign(CENTER); text("TESTER", 272, 272);
    if (l10.tested >= 0) { drawL10Part(l10.parts[l10.tested], 268, 254, 0.6); }
    // Gus + his workbench
    fill(120, 85, 45); rect(230, 290, 160, 14); rect(240, 304, 8, 60); rect(372, 304, 8, 60);
    var gx = 330; var gy = 230;
    fill(60, 90, 140); rect(gx - 18, gy, 36, 50, 6);
    fill(240, 200, 160); ellipse(gx, gy - 14, 30, 30);
    fill(90, 60, 30); ellipse(gx, gy - 4, 20, 6);
    fill(200, 220, 255); ellipse(gx - 7, gy - 18, 10, 10); ellipse(gx + 7, gy - 18, 10, 10);
    fill(30); ellipse(gx - 7, gy - 18, 4, 4); ellipse(gx + 7, gy - 18, 4, 4);
    fill(120, 80, 40); rect(gx - 15, gy - 22, 30, 3);
    drawL10GusExtras(gx, gy);
    fill(255); textSize(9); text("GUS", gx, gy + 64);
    // what he still needs
    textAlign(LEFT); textSize(9);
    for (var n = 0; n < 4; n++) { fill(l10.given[n] ? 140 : 255, l10.given[n] ? 255 : 230, l10.given[n] ? 140 : 160); text((l10.given[n] ? "[X] " : "[  ] ") + L10_PARTS[n], 250, 120 + n * 14); }
    fill(255, 240, 200); textAlign(CENTER); text("Gus needs a WORKING one of each:", 310, 104);
    // the machine
    var all = l10.given[0] && l10.given[1] && l10.given[2] && l10.given[3];
    if (all) {
        l10.machineT++;
        var mk = min(1, l10.machineT / 120);
        fill(150, 150, 165); rect(250, 300 - 70 * mk, 120, 70 * mk, 6);
        if (mk >= 1) {
            fill(255, 80, 80, 150 + sin(frameCount * 20) * 100); ellipse(270, 248, 10, 10);
            fill(80, 255, 80, 150 + cos(frameCount * 20) * 100); ellipse(290, 248, 10, 10);
            fill(40); rect(330, 260, 30, 12);
            if (!l10.realKey) { drawL10Key(345, 286, 1.2, true); fill(255, 255, 200); textSize(9); text("(click the key)", 345, 312); }
        }
        if (l10.machineT === 1) { l10Say("Gus: \"PERFECT! one KEY-MAKING MACHINE, coming up!\""); }
    }
    if (l10.held >= 0) { drawL10Part(l10.parts[l10.held], mouseX, mouseY, 1.2); }
    fill(255, 255, 220); textSize(9); textAlign(CENTER);
    text("click a part to pick it up. put it in the TESTER, or give it to GUS.", 200, 392);
    fill(0, 0, 0, 150); rect(4, 4, 60, 18, 4); fill(255); text("< BACK", 34, 17);
};
var l10ShedPressed = function() {
    var all = l10.given[0] && l10.given[1] && l10.given[2] && l10.given[3];
    if (mouseX < 66 && mouseY < 24) { l10.phase = 5; l10.held = -1; return; }
    if (all && l10.machineT > 120 && !l10.realKey && dist(mouseX, mouseY, 345, 286) < 20) {
        l10.realKey = 1; l10.phase = 5; flash(255, 240, 150, 120);
        l10Say("you got the REAL key! (go try the giant door)");
        return;
    }
    // tester
    if (mouseX > 250 && mouseX < 310 && mouseY > 236 && mouseY < 282) {
        if (l10.held >= 0) { l10.tested = l10.held; l10.held = -1; l10Say(l10.parts[l10.tested].ok ? "*DING* green light. this one WORKS!" : "*BZZT* red light. this one is BROKEN."); }
        else if (l10.tested >= 0) { l10.held = l10.tested; l10.tested = -1; }
        return;
    }
    // Gus
    if (dist(mouseX, mouseY, 330, 240) < 34) {
        if (l10.held < 0) { l10Say("Gus: \"bring me a WORKING gear, spring, battery and bulb. I'll build you something great.\""); return; }
        var P = l10.parts[l10.held];
        if (l10.given[P.t]) { l10Say("Gus: \"I already have a " + L10_PARTS[P.t] + "!\""); return; }
        if (P.ok) { l10.given[P.t] = 1; P.gone = 1; l10Say("Gus: \"a working " + L10_PARTS[P.t] + "! thanks!\""); }
        else { P.gone = 1; shake(3); l10Say("Gus: \"this " + L10_PARTS[P.t] + " is BROKEN! *throws it out the window*\""); }
        l10.held = -1;
        return;
    }
    // pick up a part
    for (var i = 0; i < l10.parts.length; i++) {
        var Q = l10.parts[i];
        if (Q.gone || i === l10.tested) { continue; }
        if (dist(mouseX, mouseY, Q.x, Q.y) < 18) { l10.held = (l10.held === i) ? -1 : i; return; }
    }
    if (l10.held >= 0) { l10.held = -1; }
};
// ---------- the whole level ----------
// ---------- PART 8: THE DART BOOTH ----------
// the target is impossible. take the 0 off the scoreboard and jam the track with it.
// the gun is jammed: there's a paper stuck in it (CODE: QWeRtYuiOp#>!$!%(=pi).
// then a LASER vaporizes your dart... follow the tangled cords under the counter and unplug the right one.
var L10_DEV = ["LASER", "LIGHTS", "POPCORN", "SIGN", "RADIO"];
var L10_DEVX = [60, 130, 200, 270, 340];
var L10_SOCKX = [80, 140, 200, 260, 320];
var L10_CODE = "QWeRtYuiOp#>!$!%(=pi";
var l10DartsNew = function() {
    var perm = [0, 1, 2, 3, 4];
    for (var i = 4; i > 0; i--) { var j = floor(random(0, i + 1)); var tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp; }
    var ctl = [];
    for (var w = 0; w < 5; w++) { ctl.push([random(30, 370), random(110, 200), random(30, 370), random(190, 290)]); }
    l10.dg = {
        tx: 200, tdir: 1, zero: 0, zx: 0, jam: 0, paper: 0, gunOpen: 0, held: "", read: 0,
        dart: null, laserOut: 0, laserDrop: 0, zapT: 0, view: 0, perm: perm, ctl: ctl,
        off: [0, 0, 0, 0, 0], win: 0, winT: 0, aim: -90, tries: 0
    };
};
var l10Plugged = function(d) { return !l10.dg.off[d]; };
var drawL10DevIcon = function(d, x, y, on) {
    noStroke();
    if (d === 0) { fill(on ? 200 : 90, on ? 40 : 60, on ? 40 : 60); rect(x - 12, y - 7, 24, 14, 3); fill(60); rect(x + 10, y - 3, 8, 6); fill(on ? 255 : 80, on ? 80 : 80, on ? 80 : 80); ellipse(x + 18, y, 4, 4); }
    else if (d === 1) { fill(on ? 255 : 120, on ? 240 : 120, on ? 150 : 110); ellipse(x, y - 2, 16, 18); fill(170); rect(x - 5, y + 6, 10, 6, 1); }
    else if (d === 2) { fill(220, 40, 40); quad(x - 10, y - 8, x + 10, y - 8, x + 7, y + 10, x - 7, y + 10); fill(255); rect(x - 6, y - 8, 3, 18); rect(x + 2, y - 8, 3, 18); fill(255, 245, 200); ellipse(x - 5, y - 10, 8, 7); ellipse(x + 3, y - 11, 8, 7); }
    else if (d === 3) { fill(40); rect(x - 15, y - 8, 30, 16, 3); fill(on ? 255 : 90, on ? 80 : 60, on ? 200 : 90); textSize(8); textAlign(CENTER); text("DARTS", x, y + 3); }
    else { fill(150, 90, 50); rect(x - 13, y - 8, 26, 16, 3); fill(40); ellipse(x - 5, y, 9, 9); fill(220); rect(x + 3, y - 4, 7, 2); rect(x + 3, y, 7, 2); fill(90); rect(x + 8, y - 16, 2, 9); }
};
var drawL10Laser = function(D) {
    // the laser hangs from a hatch in the ceiling (top right)
    var drop = D.laserDrop;
    fill(70, 60, 80); rect(300, 44, 50, 6, 2);
    if (drop <= 0) { return; }
    var ly = 44 + drop * 30;
    stroke(80); strokeWeight(3); line(325, 50, 325, ly - 6); noStroke();
    var on = l10Plugged(0);
    pushMatrix(); translate(325, ly); rotate(D.aim);
    fill(90, 90, 100); rect(-14, -9, 28, 18, 4);
    fill(60); rect(12, -4, 12, 8, 2);
    fill(on ? 255 : 70, on ? 50 : 70, on ? 50 : 70); ellipse(24, 0, 6, 6);
    popMatrix();
    fill(on ? 255 : 80, on ? 60 : 80, on ? 60 : 80); ellipse(318, ly - 4, 4, 4);
    // its power cord runs along the ceiling and down the wall to the cabinet
    noFill(); stroke(30); strokeWeight(2);
    bezier(325, 44, 360, 40, 392, 60, 392, 120); line(392, 120, 392, 300); bezier(392, 300, 392, 320, 372, 330, 362, 336);
    noStroke();
};
var drawL10Pockets = function() {
    var D = l10.dg;
    fill(0, 0, 0, 160); rect(6, 368, 92, 28, 5);
    fill(200); textSize(7); textAlign(LEFT); text("POCKET", 10, 376);
    // slot 1: the 0     slot 2: the paper
    fill(D.held === "zero" ? 120 : 50); rect(44, 371, 24, 22, 3);
    fill(D.held === "paper" ? 120 : 50); rect(70, 371, 24, 22, 3);
    if (D.zero === 1 && D.held !== "zero") { fill(255, 120, 40); textSize(18); textAlign(CENTER); text("0", 56, 389); }
    if (D.paper === 1) { fill(250, 250, 240); rect(75, 375, 14, 14, 1); fill(80); rect(77, 379, 10, 1); rect(77, 383, 8, 1); }
    if (D.held === "zero") { fill(255, 120, 40); textSize(22); textAlign(CENTER); text("0", mouseX, mouseY + 8); }
    if (D.read) {
        fill(0, 0, 0, 170); rect(0, 0, 400, 400);
        fill(250, 248, 235); rect(80, 130, 240, 120, 3);
        fill(60); textSize(14); textAlign(CENTER); text("CODE:", 200, 170);
        textSize(18); text(L10_CODE, 200, 205);
        fill(150); textSize(9); text("(a crumpled piece of paper)", 200, 236);
    }
};
var drawL10Booth = function() {
    var D = l10.dg; var i;
    noStroke();
    // back wall + striped awning
    background(60, 30, 50);
    for (i = 0; i < 10; i++) { fill(i % 2 ? 230 : 200, i % 2 ? 230 : 40, i % 2 ? 230 : 50); rect(i * 40, 0, 40, 44); }
    for (i = 0; i < 10; i++) { fill(i % 2 ? 230 : 200, i % 2 ? 230 : 40, i % 2 ? 230 : 50); arc(i * 40 + 20, 44, 40, 20, 0, 180); }
    for (i = 0; i < 12; i++) { fill(255, 220, 100, 140 + sin(frameCount * 6 + i * 40) * 100); ellipse(18 + i * 33, 58, 6, 6); }
    // the neon sign
    var signOn = l10Plugged(3);
    fill(30); rect(150, 64, 100, 28, 5);
    fill(signOn ? 255 : 90, signOn ? 70 : 60, signOn ? 200 : 90); textSize(18); textAlign(CENTER); text("DARTS", 200, 85);
    if (signOn) { fill(255, 70, 200, 40); rect(146, 60, 108, 36, 8); }
    // the scoreboard
    fill(30, 30, 35); rect(14, 62, 110, 44, 4); fill(10); rect(18, 66, 102, 36, 3);
    fill(255, 180, 60); textSize(10); textAlign(LEFT); text("SCORE:", 24, 89);
    if (D.zero === 0) { fill(255, 120, 40); textSize(30); textAlign(CENTER); text("0", 98, 96); }
    else if (D.win) { fill(255, 120, 40); textSize(30); textAlign(CENTER); text("1", 98, 96); }
    // popcorn machine (left) + radio (right)
    fill(200, 40, 40); rect(20, 196, 50, 70, 4); fill(255, 250, 220, 220); rect(24, 202, 42, 40, 2);
    for (i = 0; i < 9; i++) { fill(255, 245, 200); ellipse(30 + (i * 13) % 36, 236 - floor(i / 3) * 7 - (l10Plugged(2) ? abs(sin(frameCount * 9 + i * 50)) * 4 : 0), 7, 6); }
    fill(150, 90, 50); rect(332, 230, 50, 32, 4); fill(40); ellipse(346, 246, 18, 18); fill(220); rect(360, 240, 16, 3); rect(360, 246, 16, 3); fill(90); rect(372, 216, 2, 14);
    if (l10Plugged(4)) { fill(255, 255, 255, 180); textSize(10); textAlign(CENTER); text("~ la la ~", 357, 222 - (frameCount % 40) / 4); }
    // the target rail + target
    fill(120, 120, 130); rect(40, 172, 320, 8, 3); fill(90); rect(40, 178, 320, 2);
    if (D.zero === 2) { fill(255, 120, 40); textSize(22); textAlign(CENTER); text("0", D.zx, 184); }
    if (!D.jam && !D.win) {
        var sp = 7;
        // it sees your dart coming and dodges
        if (D.dart && D.dart.y < 240) { if (abs(D.dart.x - D.tx) < 50) { D.tdir = D.dart.x > D.tx ? -1 : 1; sp = 11; } }
        var nx = D.tx + D.tdir * sp;
        if (nx > 340) { nx = 340; D.tdir = -1; } if (nx < 60) { nx = 60; D.tdir = 1; }
        if (D.zero === 2 && ((D.tx < D.zx - 22 && nx >= D.zx - 22) || (D.tx > D.zx + 22 && nx <= D.zx + 22))) {
            nx = D.tx < D.zx ? D.zx - 22 : D.zx + 22; D.jam = 1; shake(4); l10Say("*CLUNK* the target hits the 0 and gets STUCK!");
        }
        D.tx = nx;
    }
    var tw = D.jam && !D.win ? sin(frameCount * 40) * 1.5 : 0;
    fill(80); rect(D.tx - 3 + tw, 154, 6, 22);
    fill(255); ellipse(D.tx + tw, 150, 36, 36); fill(220, 40, 40); ellipse(D.tx + tw, 150, 28, 28);
    fill(255); ellipse(D.tx + tw, 150, 18, 18); fill(220, 40, 40); ellipse(D.tx + tw, 150, 8, 8);
    if (D.win) { fill(40); ellipse(D.tx, 150, 4, 4); fill(200, 180, 60); rect(D.tx - 1, 150, 2, 14); }
    drawL10Laser(D);
    // the counter + cabinet door
    fill(140, 80, 40); rect(0, 296, 400, 70); fill(170, 100, 50); rect(0, 296, 400, 8);
    fill(120, 70, 35); rect(300, 314, 60, 44, 3); fill(100, 60, 30); rect(304, 318, 52, 36, 2); fill(220, 190, 80); ellipse(350, 336, 5, 5);
    // the dart gun (on a swivel)
    if (!D.gunOpen) {
        var a = atan2(mouseY - 316, mouseX - 200);
        if (mouseY > 296) { a = -90; }
        D.aim = a;
    }
    pushMatrix(); translate(200, 316); rotate(D.gunOpen ? -60 : D.aim);
    fill(60, 160, 220); rect(-10, -8, 40, 16, 4); fill(40, 120, 180); rect(26, -4, 14, 8, 2);
    fill(250, 210, 60); rect(-4, 6, 10, 14, 2);
    if (D.paper === 0) { fill(250, 250, 240); rect(34, -10, 8, 10, 1); }
    popMatrix();
    fill(90); ellipse(200, 316, 12, 12);
    if (D.gunOpen && D.paper === 0) {
        fill(0, 0, 0, 120); rect(0, 0, 400, 400);
        fill(60, 160, 220); rect(110, 170, 180, 60, 8); fill(40, 120, 180); rect(250, 182, 50, 36, 4);
        fill(30); rect(262, 190, 26, 20, 3);
        fill(250, 250, 240); rect(270, 160, 40, 46, 2); fill(60); textSize(6); textAlign(LEFT); text("CODE:", 273, 172); text("QWeRtY...", 273, 182);
        fill(255); textSize(11); textAlign(CENTER); text("something is stuck in the barrel...", 200, 260);
    }
    // the dart in the air
    if (D.dart) {
        var dd = D.dart;
        dd.x += dd.vx; dd.y += dd.vy;
        pushMatrix(); translate(dd.x, dd.y); rotate(atan2(dd.vy, dd.vx));
        fill(160); rect(-8, -1.5, 14, 3); fill(220, 40, 40); triangle(-12, -4, -12, 4, -6, 0); fill(80); triangle(6, -2, 6, 2, 10, 0);
        popMatrix();
        if (D.laserDrop > 0 && l10Plugged(0) && dd.y < 230) {
            // ZAP
            D.zapT = 10; D.zapX = dd.x; D.zapY = dd.y; D.dart = null;
            burst(dd.x, dd.y, 255, 80, 60, 14, 2.5, 0);
            D.zaps = (D.zaps || 0) + 1;
            l10Say(D.zaps < 2 ? "ZAP!! a LASER vaporized your dart in mid-air!!" : "ZAP!! (that laser has to be plugged in somewhere...)");
        } else if (dd.y <= 158 && dd.y > 158 + dd.vy - 1) {
            if (abs(dd.x - D.tx) < 16) {
                D.dart = null; D.win = 1; D.winT = 0; flash(255, 240, 150, 160); shake(8);
            }
        }
        if (D.dart && (dd.y < -10 || dd.x < -10 || dd.x > 410)) { D.dart = null; if (!D.jam) { l10Say("missed! (the target saw it coming)"); } }
    }
    if (D.zapT > 0) {
        D.zapT--;
        stroke(255, 60, 60, 200); strokeWeight(3); line(325 + cos(D.aim) * 24, 74 + sin(D.aim) * 24, D.zapX, D.zapY); noStroke();
        fill(255, 220, 200, D.zapT * 25); ellipse(D.zapX, D.zapY, 30, 30);
    }
    if (D.laserDrop > 0 && D.laserDrop < 1) { D.laserDrop = min(1, D.laserDrop + 0.08); }
    if (D.laserDrop > 0 && l10Plugged(0) && D.dart) { D.aim = atan2(D.dart.y - 74, D.dart.x - 325); }
    // lights off?
    if (!l10Plugged(1)) { fill(0, 0, 0, 235); rect(0, 0, 400, 400); fill(120, 255, 120, 150); ellipse(330, 336, 8, 8); }
    // inventory
    drawL10Pockets();
    if (D.win) {
        D.winT++;
        fill(0, 0, 0, min(200, D.winT * 3)); rect(0, 0, 400, 400);
        fill(255, 230, 80); textSize(36); textAlign(CENTER); text("BULLSEYE!!", 200, 190);
        if (D.winT > 90) { fill(220); textSize(12); text("(to be continued...)", 200, 226); }
    }
};
// ---- under the counter: the tangle of cords ----
var l10WireEnd = function(d) {
    var D = l10.dg; var sx = L10_SOCKX[D.perm[d]];
    return D.off[d] ? [sx + 6, 286] : [sx, 318];
};
var drawL10Tangle = function() {
    var D = l10.dg; var i;
    noStroke();
    background(50, 34, 24);
    for (i = 0; i < 8; i++) { fill(58 + (i % 2) * 6, 40, 28); rect(i * 50, 0, 49, 400); }
    fill(30, 20, 14); rect(0, 0, 400, 24);
    fill(220); textSize(10); textAlign(CENTER); text("under the counter", 200, 16);
    // where each cord comes from (holes in the top)
    for (i = 0; i < 5; i++) {
        fill(20); ellipse(L10_DEVX[i], 74, 14, 8);
        drawL10DevIcon(i, L10_DEVX[i], 54, l10Plugged(i));
        fill(200, 190, 170); textSize(7); textAlign(CENTER); text(L10_DEV[i], L10_DEVX[i], 36);
    }
    // the cords (all the same boring black...)
    for (i = 0; i < 5; i++) {
        var C = D.ctl[i]; var E = l10WireEnd(i);
        noFill(); stroke(10); strokeWeight(6); bezier(L10_DEVX[i], 74, C[0], C[1], C[2], C[3], E[0], E[1] - 14);
        stroke(42, 40, 44); strokeWeight(3.5); bezier(L10_DEVX[i], 74, C[0], C[1], C[2], C[3], E[0], E[1] - 14);
        noStroke();
    }
    // the power strip
    fill(230, 230, 225); rect(50, 318, 300, 34, 6); fill(200, 200, 195); rect(50, 344, 300, 8, 4);
    fill(255, 60, 60); rect(330, 324, 10, 6, 2);
    for (i = 0; i < 5; i++) {
        var sx = L10_SOCKX[i];
        fill(60); rect(sx - 4, 330, 2, 7); rect(sx + 3, 330, 2, 7); ellipse(sx, 342, 3, 3);
    }
    // the plugs
    for (i = 0; i < 5; i++) {
        var P = l10WireEnd(i);
        fill(30); rect(P[0] - 9, P[1] - 16, 18, 18, 3); fill(50); rect(P[0] - 7, P[1] - 14, 14, 4, 2);
        if (D.off[i]) { fill(200); rect(P[0] - 5, P[1] + 2, 2, 6); rect(P[0] + 3, P[1] + 2, 2, 6); }
    }
    fill(0, 0, 0, 150); rect(4, 4, 60, 18, 4); fill(255); textSize(9); textAlign(CENTER); text("< BACK", 34, 17);
    if (!l10Plugged(1)) {
        fill(0, 0, 0, 240); rect(0, 0, 400, 400);
        var L = l10WireEnd(1);
        fill(120, 255, 120, 120 + sin(frameCount * 6) * 60); rect(L[0] - 9, L[1] - 16, 18, 18, 3);
    }
};
var l10TanglePressed = function() {
    var D = l10.dg;
    if (mouseX < 66 && mouseY < 24) { D.view = 0; return; }
    for (var d = 0; d < 5; d++) {
        var P = l10WireEnd(d);
        if (abs(mouseX - P[0]) < 12 && mouseY > P[1] - 20 && mouseY < P[1] + 10) {
            if (!l10Plugged(1) && d !== 1) { return; }
            D.off[d] = D.off[d] ? 0 : 1;
            if (D.off[d]) {
                shake(2);
                l10Say(["the laser powers down with a sad little beep.", "CLICK. it's PITCH BLACK.", "the popcorn machine stops. one last sad *pop*.",
                    "the DARTS sign goes dark.", "the music stops. awkward silence."][d]);
            } else { l10Say(d === 1 ? "the lights come back on. phew." : "plugged back in."); }
            return;
        }
    }
};
var l10BoothPressed = function() {
    var D = l10.dg;
    if (D.win) { return; }
    if (D.view === 1) { l10TanglePressed(); return; }
    if (D.read) { D.read = 0; return; }
    if (!l10Plugged(1)) {
        // in the dark you can only find the cabinet (there's a little glowing light)
        if (mouseX > 300 && mouseX < 360 && mouseY > 314 && mouseY < 358) { D.view = 1; }
        return;
    }
    // pockets
    if (mouseY > 370 && mouseY < 394) {
        if (mouseX > 44 && mouseX < 68 && D.zero === 1) { D.held = D.held === "zero" ? "" : "zero"; return; }
        if (mouseX > 70 && mouseX < 94 && D.paper === 1) { D.read = 1; return; }
    }
    // the gun is open: take the paper
    if (D.gunOpen) {
        if (D.paper === 0 && mouseX > 266 && mouseX < 314 && mouseY > 156 && mouseY < 210) {
            D.paper = 1; D.gunOpen = 0; flash(255, 255, 240, 60);
            l10Say("you pull out a crumpled piece of paper. the gun is UN-jammed!");
        } else { D.gunOpen = 0; }
        return;
    }
    // holding the 0: put it on the rail
    if (D.held === "zero") {
        if (mouseX > 40 && mouseX < 360 && mouseY > 136 && mouseY < 196 && abs(mouseX - D.tx) > 26) {
            D.zero = 2; D.zx = constrain(mouseX, 50, 350); D.held = "";
            l10Say("you wedge the 0 into the target's track.");
        } else { D.held = ""; }
        return;
    }
    // the scoreboard 0
    if (D.zero === 0 && mouseX > 80 && mouseX < 118 && mouseY > 64 && mouseY < 104) {
        D.zero = 1; shake(2); l10Say("you pry the 0 off the scoreboard. (it's yours now)"); return;
    }
    // the cabinet under the counter
    if (mouseX > 300 && mouseX < 360 && mouseY > 314 && mouseY < 358) { D.view = 1; return; }
    // the gun itself
    if (dist(mouseX, mouseY, 200, 306) < 22) {
        if (D.paper === 0) { D.gunOpen = 1; } else { l10Say("a dart gun. it works now!"); }
        return;
    }
    // FIRE
    if (mouseY < 296 && !D.dart) {
        if (D.paper === 0) { shake(2); l10Say("*click* ...*click click*  the gun is JAMMED."); return; }
        var a = atan2(mouseY - 316, mouseX - 200);
        D.dart = {x: 200 + cos(a) * 40, y: 316 + sin(a) * 40, vx: cos(a) * 9, vy: sin(a) * 9};
        D.tries++;
        if (D.laserDrop === 0 && D.jam) { D.laserDrop = 0.5; }
    }
};
var drawL10Darts = function() {
    if (!l10.dg) { l10DartsNew(); }
    if (l10.dg.view === 1) { drawL10Tangle(); } else { drawL10Booth(); }
};
var drawLevel10 = function() {
    l10T++;
    if (l10.phase < 0) { l10 = {phase: 0, t: 0, round: 0, resetT: 0, msg: "", msgT: 0, hasKey: 0, doorT: 0, helpT: 0, help: null, shedOpen: 0, realKey: 0, parts: null}; l10MakeBananas(); l10ChessNew(); }
    if (l10.phase === 0) { drawL10Bananas(); }
    else if (l10.phase === 1) {
        l10.t++;
        background(8, 6, 14);
        noStroke();
        for (var i = 0; i < 40; i++) { fill(255, 255, 255, 100); ellipse((i * 67) % 400, (i * 131 + l10T * 0.5) % 400, 2, 2); }
        drawL10TitleBits();
        textAlign(CENTER);
        var tt = l10.t;
        var g = (tt < 12) ? random(-6, 6) : 0;
        fill(255, 225, 60); textSize(48);
        if (l10.round < 4) {
            text("LEVEL 10", 200 + g, 170); textSize(22); text("PT " + (l10.round + 2), 200, 204);
            fill(255); textSize(14); text("now there are " + L10_BN[l10.round + 1] + " bananas.", 200, 240);
            if (tt > 40) { fill(200, 200, 200, 150 + sin(frameCount * 6) * 100); textSize(11); text("(click to go on)", 200, 290); }
        } else {
            text("LEVEL 10", 200 + g, 130); textSize(22); text("PT 6", 200, 162);
            fill(255); textSize(14); text("CHESS against the AI.", 200, 200);
            textSize(11); fill(255, 200, 200);
            text("every time a piece dies (yours OR theirs), YOU get 1 point.", 200, 230);
            text("get 5 points and you LOSE. (checkmate the AI to win)", 200, 248);
            if (tt > 40) { fill(200, 200, 200, 150 + sin(frameCount * 6) * 100); text("(click to start)", 200, 290); }
        }
        if (tt === 1) { shake(8); flash(255, 255, 255, 120); }
        // the title goes away by itself after a bit
        if (tt >= (l10.round < 4 ? 170 : 420)) {
            if (l10.round < 4) { l10.round++; l10MakeBananas(); l10.phase = 0; } else { l10.phase = 2; l10ChessNew(); }
        }
    }
    else if (l10.phase === 2) { drawL10Chess(); }
    else if (l10.phase === 3) { drawL10Break(); }
    else if (l10.phase === 4) { drawL10Rewind(); }
    else if (l10.phase === 5 || l10.phase === 7) { drawL10Site(); }
    else if (l10.phase === 6) { drawL10Shed(); }
    else if (l10.phase === 8) { drawL10Darts(); }
    if (l10.msgT > 0 && l10.phase !== 3) {
        l10.msgT--;
        textSize(11); textAlign(CENTER);
        var w = textWidth(l10.msg) + 16;
        fill(0, 0, 0, min(200, l10.msgT * 6)); rect(200 - w / 2, 352, w, 20, 5);
        fill(255, 255, 255, min(255, l10.msgT * 8)); text(l10.msg, 200, 366);
    }
};
var l10Pressed = function() {
    if (l10.phase < 0) { return; }
    if (l10.phase === 0) { l10BananaPressed(); return; }
    if (l10.phase === 1) {
        if (l10.t <= 40) { return; }
        if (l10.round < 4) { l10.round++; l10MakeBananas(); l10.phase = 0; }
        else { l10.phase = 2; l10ChessNew(); }
        return;
    }
    if (l10.phase === 2) { l10ChessPressed(); return; }
    if (l10.phase === 3) { l10BreakPressed(); return; }
    if (l10.phase === 4) { l10RewindPressed(); return; }
    if (l10.phase === 5 || l10.phase === 7) { l10SitePressed(); return; }
    if (l10.phase === 6) { l10ShedPressed(); }
    if (l10.phase === 8 && l10.dg) { l10BoothPressed(); }
};

var mousePressedReal = function() {
    if (cheatOn) { cheatOn = 0; cheatSkipRel = 1; return; }
    if (level === 10) { l10Pressed(); return; }
    if (level === SECRET_LEVEL) { srMousePressed(); return; }
    if (level === RAIN_LEVEL) { rnPressed(); return; }
    if (level === TRES_LEVEL) { tsPressed(); return; }
    if (level === 9) { level9MousePressed(); return; }
    if (level === 8) { level8MousePressed(); return; }
    if (level === 7) { level7MousePressed(); return; }
    if (level === 6) { level6MousePressed(); return; }
    if (level === 5) { level5MousePressed(); return; }
    if (level === 4) { level4MousePressed(); return; }
    if (level === 3) { level3MousePressed(); return; }
    if (level === 2) { level2ForestMousePressed(); return; }
    if (srL1Pressed()) { return; }
    // go to forest button on level 1
    if (goToForestButton &&
        mouseX >= 5 && mouseX <= 90 &&
        mouseY >= 375 && mouseY <= 395) {
        level = 2;
        playerMonster.visible = 1;
        playerMonster.cx = 200; playerMonster.cy = 100;
        monsterZoomingToTree = 0;
        return;
    }
    if (arrowVisible && !monsterAteWolf) {
        var trunkH = treeGrowth * 0.8;
        var trunkTop = holeY - trunkH;
        var ax = holeX; var ay = trunkTop - 20;
        if (mouseX >= ax - 10 && mouseX <= ax + 10 &&
            mouseY >= ay - 14 && mouseY <= ay + 10) {
            level = 2; return;
        }
    }
    if (dist(mouseX, mouseY, sun.x, sun.y) < 25 && dayTime) {
        dayTime = false; moonOffScreen = false;
        moon.x = 300; moon.y = 41;
        skyR = 30; skyG = 30; skyB = 30;
        sunThereYet = false; sun.x = 470;
        itRaining = false; drops = [];
        return;
    }
    if (frog.visible && !frog.caught && !frogEmerging && catchWindowOpen) {
        if (mouseX >= frog.x - 10 && mouseX <= frog.x + 10 &&
            mouseY >= frog.y - 8 && mouseY <= frog.y + 8) {
            frog.caught = 1; catchWindowOpen = 0;
            frog.x = puddle.x + puddle.width * 0.5 + 20;
            frog.y = 285; return;
        }
    }
    if (puddle.visible && gameStage === 1 && !fishingLine.active && !fishCaught && !rawFish.visible) {
        var px = puddle.x + puddle.width * 0.5; var py = puddle.y;
        if (dist(mouseX, mouseY, px, py) < 35) {
            fishingLine.active = 1;
            fishingLine.x = px; fishingLine.y = 0; fishingLine.hookY = 10;
            fishBobTimer = 0; fishOnHook = 0; reeling = 0;
            return;
        }
    }
    if (fishingLine.active && fishOnHook) { reeling = 1; return; }
    if (wareWolf && !moonOffScreen && gameStage < 10 &&
        mouseX >= moon.x - 25 && mouseX <= moon.x + 25 &&
        mouseY >= moon.y - 25 && mouseY <= moon.y + 25) {
        moonOffScreen = true; dayTime = true; wareWolf = false;
    } else if (isMouseInside(cloud)) {
        draggingBtn = cloud;
        dragOffsetX = mouseX - cloud.x; dragOffsetY = mouseY - cloud.y;
    } else if (gameStage >= 10 && !dayTime && dist(mouseX, mouseY, sun.x, sun.y) < 25) {
        draggingBtn = sun;
        dragOffsetX = mouseX - sun.x; dragOffsetY = mouseY - sun.y;
    } else if (isMouseInside(seed) && !seedBuried) {
        draggingBtn = seed;
        dragOffsetX = mouseX - seed.x; dragOffsetY = mouseY - seed.y;
    } else if (isMouseInside(shovel)) {
        draggingBtn = shovel;
        dragOffsetX = mouseX - shovel.x; dragOffsetY = mouseY - shovel.y;
    } else if (isMouseInside(leaves) && leavesOnTree) {
        draggingBtn = leaves; leavesDetached = 1;
        dragOffsetX = mouseX - leaves.x; dragOffsetY = mouseY - leaves.y;
    } else if (meat.visible && mouseX >= meat.x - 10 && mouseX <= meat.x + 10 && mouseY >= meat.y - 8 && mouseY <= meat.y + 8) {
        draggingBtn = meat; meatDragging = 1;
        dragOffsetX = mouseX - meat.x; dragOffsetY = mouseY - meat.y;
    } else if (cookedNut.visible && mouseX >= cookedNut.x - 6 && mouseX <= cookedNut.x + 6 && mouseY >= cookedNut.y - 8 && mouseY <= cookedNut.y + 8) {
        draggingBtn = cookedNut; cookedNutDragging = 1;
        dragOffsetX = mouseX - cookedNut.x; dragOffsetY = mouseY - cookedNut.y;
    } else if (nutPaste.visible && mouseX >= nutPaste.x && mouseX <= nutPaste.x + 14 && mouseY >= nutPaste.y - 6 && mouseY <= nutPaste.y + 6) {
        draggingBtn = nutPaste; nutPasteDragging = 1;
        dragOffsetX = mouseX - nutPaste.x; dragOffsetY = mouseY - nutPaste.y;
    } else if (smokedPaste.visible && mouseX >= smokedPaste.x && mouseX <= smokedPaste.x + 14 && mouseY >= smokedPaste.y - 6 && mouseY <= smokedPaste.y + 6) {
        draggingBtn = smokedPaste; smokedPasteDragging = 1;
        dragOffsetX = mouseX - smokedPaste.x; dragOffsetY = mouseY - smokedPaste.y;
    } else if (cookedMushroom.visible && mouseX >= cookedMushroom.x && mouseX <= cookedMushroom.x + 16 && mouseY >= cookedMushroom.y - 14 && mouseY <= cookedMushroom.y + 8) {
        draggingBtn = cookedMushroom; cookedMushroomDragging = 1;
        dragOffsetX = mouseX - cookedMushroom.x; dragOffsetY = mouseY - cookedMushroom.y;
    } else if (rawFish.visible && mouseX >= rawFish.x - 11 && mouseX <= rawFish.x + 11 && mouseY >= rawFish.y - 6 && mouseY <= rawFish.y + 6) {
        draggingBtn = rawFish; rawFishDragging = 1;
        dragOffsetX = mouseX - rawFish.x; dragOffsetY = mouseY - rawFish.y;
    } else if (cookedFish.visible && mouseX >= cookedFish.x - 11 && mouseX <= cookedFish.x + 11 && mouseY >= cookedFish.y - 6 && mouseY <= cookedFish.y + 6) {
        draggingBtn = cookedFish; cookedFishDragging = 1;
        dragOffsetX = mouseX - cookedFish.x; dragOffsetY = mouseY - cookedFish.y;
    } else if (frog.visible && frog.caught && mouseX >= frog.x - 10 && mouseX <= frog.x + 10 && mouseY >= frog.y - 8 && mouseY <= frog.y + 8) {
        draggingBtn = frog;
        dragOffsetX = mouseX - frog.x; dragOffsetY = mouseY - frog.y;
    } else if (cookedFrog.visible && mouseX >= cookedFrog.x - 10 && mouseX <= cookedFrog.x + 10 && mouseY >= cookedFrog.y - 7 && mouseY <= cookedFrog.y + 7) {
        draggingBtn = cookedFrog; cookedFrogDragging = 1;
        dragOffsetX = mouseX - cookedFrog.x; dragOffsetY = mouseY - cookedFrog.y;
    } else if (gameStage >= 6 && cursedApple.visible && cursedAppleGrowth >= 100 && mouseX >= cursedApple.x && mouseX <= cursedApple.x + 16 && mouseY >= cursedApple.y - 5 && mouseY <= cursedApple.y + 16) {
        draggingBtn = cursedApple; cursedAppleDragging = 1;
        dragOffsetX = mouseX - cursedApple.x; dragOffsetY = mouseY - cursedApple.y;
    } else if (moonstone.visible && mouseX >= moonstone.x && mouseX <= moonstone.x + 14 && mouseY >= moonstone.y - 8 && mouseY <= moonstone.y + 8) {
        draggingBtn = moonstone; moonstoneDragging = 1;
        dragOffsetX = mouseX - moonstone.x; dragOffsetY = mouseY - moonstone.y;
    } else if (crystalCandy.visible && mouseX >= crystalCandy.x && mouseX <= crystalCandy.x + 14 && mouseY >= crystalCandy.y - 10 && mouseY <= crystalCandy.y + 8) {
        draggingBtn = crystalCandy; crystalCandyDragging = 1;
        dragOffsetX = mouseX - crystalCandy.x; dragOffsetY = mouseY - crystalCandy.y;
    } else if (eclipseBerry.visible && mouseX >= eclipseBerry.x && mouseX <= eclipseBerry.x + 12 && mouseY >= eclipseBerry.y - 8 && mouseY <= eclipseBerry.y + 8) {
        draggingBtn = eclipseBerry; eclipseBerryDragging = 1;
        dragOffsetX = mouseX - eclipseBerry.x; dragOffsetY = mouseY - eclipseBerry.y;
    } else {
        if (playerMonster.visible && l1CurrentFood.visible &&
            mouseX >= l1CurrentFood.x - 10 && mouseX <= l1CurrentFood.x + 30 &&
            mouseY >= l1CurrentFood.y - 12 && mouseY <= l1CurrentFood.y + 12) {
            draggingBtn = l1CurrentFood;
            dragOffsetX = mouseX - l1CurrentFood.x;
            dragOffsetY = mouseY - l1CurrentFood.y;
        }
        var pickedBerry = false;
        if (gameStage >= 7 && !dayTime && bushGrowth >= 80) {
            for (var i = 0; i < moonberries.length; i++) {
                var b = moonberries[i];
                if (b.visible && mouseX >= b.x - 8 && mouseX <= b.x + 8 && mouseY >= b.y - 8 && mouseY <= b.y + 8) {
                    draggingBtn = b;
                    dragOffsetX = mouseX - b.x; dragOffsetY = mouseY - b.y;
                    pickedBerry = true; break;
                }
            }
        }
        if (!pickedBerry && gameStage >= 4) {
            for (var j = 0; j < nuts.length; j++) {
                var n = nuts[j];
                if (mouseX >= n.x - 6 && mouseX <= n.x + 6 && mouseY >= n.y - 8 && mouseY <= n.y + 8) {
                    draggingBtn = n;
                    dragOffsetX = mouseX - n.x; dragOffsetY = mouseY - n.y;
                    if (n.onGround) { n.onGround = 0; nutOnGround = -1; }
                    break;
                }
            }
        }
        if (!pickedBerry && gameStage >= 5) {
            for (var k = 0; k < mushrooms.length; k++) {
                var m = mushrooms[k];
                if (m.growth >= 100 && mouseX >= m.x && mouseX <= m.x + 16 && mouseY >= m.y - 14 && mouseY <= m.y + 8) {
                    draggingBtn = m;
                    dragOffsetX = mouseX - m.x; dragOffsetY = mouseY - m.y;
                    break;
                }
            }
        }
    }
};

var mouseDraggedReal = function() {
    if (cheatOn || cheatSkipRel) { return; }
    if (level === SECRET_LEVEL || level === RAIN_LEVEL || level === TRES_LEVEL || level === 10) { return; }
    if (level === 9) { level9MouseDragged(); return; }
    if (level === 8) { level8MouseDragged(); return; }
    if (level === 7) { level7MouseDragged(); return; }
    if (level === 6) { level6MouseDragged(); return; }
    if (level === 5) { level5MouseDragged(); return; }
    if (level === 4) { level4MouseDragged(); return; }
    if (level === 3) { level3MouseDragged(); return; }
    if (level === 2) { level2ForestMouseDragged(); return; }
    if (draggingBtn !== -1) {
        draggingBtn.x = mouseX - dragOffsetX;
        draggingBtn.y = mouseY - dragOffsetY;
    }
};

var mouseReleasedReal = function() {
    if (cheatSkipRel) { cheatSkipRel = 0; return; }
    if (level === 10) { return; }
    if (level === SECRET_LEVEL) { srMouseReleased(); return; }
    if (level === RAIN_LEVEL || level === TRES_LEVEL) { return; }
    if (level === 9) { level9MouseReleased(); return; }
    if (level === 8) { level8MouseReleased(); return; }
    if (level === 7) { level7MouseReleased(); return; }
    if (level === 6) { level6MouseReleased(); return; }
    if (level === 5) { level5MouseReleased(); return; }
    if (level === 4) { level4MouseReleased(); return; }
    if (level === 3) { level3MouseReleased(); return; }
    if (level === 2) { level2ForestMouseReleased(); return; }
    if (srL1Released()) { return; }
    if (draggingBtn === shovel) {
        if (shovel.y >= 280 && shovel.y <= 320 && !holeExists) {
            holeExists = true; holeX = shovel.x + 15; holeY = 300;
        }
        if (holeExists && seedBuried && !holeFilled) {
            var dx = (shovel.x + 15) - holeX; var dy = shovel.y - holeY;
            if (dx * dx + dy * dy < 30 * 30) { holeFilled = true; }
        }
        if (gameStage >= 8 && nuts.length > 0 && !nutPaste.visible && !smokedPaste.visible) {
            for (var ni = 0; ni < nuts.length; ni++) {
                var nn = nuts[ni];
                if (nn.onGround) {
                    var gndx = (shovel.x + 15) - nn.x; var gndy = shovel.y - nn.y;
                    if (gndx * gndx + gndy * gndy < 30 * 30) {
                        nutPaste.visible = 1;
                        nutPaste.x = nn.x; nutPaste.y = nn.y;
                        nuts.splice(ni, 1); nutOnGround = -1; break;
                    }
                }
            }
        }
    }
    if (draggingBtn === seed && holeExists && !seedBuried && !holeFilled) {
        var sdx = seed.x - holeX; var sdy = seed.y - holeY;
        if (sdx * sdx + sdy * sdy < 25 * 25) { seedBuried = true; }
    }
    if (draggingBtn === leaves) {
        var ldx = (leaves.x + 20) - sun.x; var ldy = (leaves.y + 10) - sun.y;
        if (ldx * ldx + ldy * ldy < 50 * 50) { leavesOnFire = true; }
        if (leavesOnFire && squirrel.alive && squirrelActive && !squirrel.burning) {
            var lsx = (leaves.x + 20) - squirrel.x; var lsy = (leaves.y + 10) - squirrel.y;
            if (lsx * lsx + lsy * lsy < 30 * 30) { squirrel.burning = 1; squirrel.burnTimer = 60; }
        }
    }
    for (var i = 0; i < nuts.length; i++) {
        var n = nuts[i];
        if (draggingBtn === n) {
            if (leavesOnFire) {
                var ndx = n.x - (leaves.x + 20); var ndy = n.y - (leaves.y + 10);
                if (ndx * ndx + ndy * ndy < 35 * 35) {
                    cookedNut.visible = 1; cookedNut.x = n.x; cookedNut.y = n.y;
                    nuts.splice(i, 1);
                    if (nutOnGround === i) { nutOnGround = -1; }
                    break;
                }
            }
            if (n.y >= 285) { n.onGround = 1; n.y = 293; nutOnGround = i; }
            break;
        }
    }
    for (var mi = 0; mi < mushrooms.length; mi++) {
        var msh = mushrooms[mi];
        if (draggingBtn === msh && leavesOnFire) {
            var mfdx = (msh.x + 8) - (leaves.x + 20); var mfdy = msh.y - (leaves.y + 10);
            if (mfdx * mfdx + mfdy * mfdy < 40 * 40) {
                cookedMushroom.visible = 1; cookedMushroom.x = msh.x; cookedMushroom.y = msh.y;
                mushrooms.splice(mi, 1); break;
            }
        }
    }
    if (draggingBtn === nutPaste && leavesOnFire) {
        var npdx = nutPaste.x - (leaves.x + 20); var npdy = nutPaste.y - (leaves.y + 10);
        if (npdx * npdx + npdy * npdy < 40 * 40) {
            smokedPaste.visible = 1; smokedPaste.x = nutPaste.x; smokedPaste.y = nutPaste.y;
            nutPaste.visible = 0; nutPasteDragging = 0;
        }
    }
    if (draggingBtn === nutPaste) { nutPasteDragging = 0; }
    if (draggingBtn === moonstone && leavesOnFire && !dayTime) {
        var msdx = moonstone.x - (leaves.x + 20); var msdy = moonstone.y - (leaves.y + 10);
        if (msdx * msdx + msdy * msdy < 40 * 40) {
            crystalCandy.visible = 1; crystalCandy.x = moonstone.x; crystalCandy.y = moonstone.y;
            moonstone.visible = 0; moonstoneDragging = 0;
        }
    }
    if (draggingBtn === moonstone) { moonstoneDragging = 0; }
    if (draggingBtn === rawFish && leavesOnFire) {
        var rfdx = rawFish.x - (leaves.x + 20); var rfdy = rawFish.y - (leaves.y + 10);
        if (rfdx * rfdx + rfdy * rfdy < 40 * 40) {
            cookedFish.visible = 1; cookedFish.x = rawFish.x; cookedFish.y = rawFish.y;
            rawFish.visible = 0; rawFishDragging = 0;
        }
    }
    if (draggingBtn === rawFish) { rawFishDragging = 0; }
    if (draggingBtn === frog && frog.caught && leavesOnFire) {
        var frdx = frog.x - (leaves.x + 20); var frdy = frog.y - (leaves.y + 10);
        if (frdx * frdx + frdy * frdy < 40 * 40) { cookedFrog.visible = 1; cookedFrog.x = frog.x; cookedFrog.y = frog.y; frog.visible = 0; }
    }
    // feed player monster new foods
    if (playerMonster.visible && !monsterAteWolf && draggingBtn === l1CurrentFood) {
        var pmdx = l1CurrentFood.x - playerMonster.x;
        var pmdy = l1CurrentFood.y - playerMonster.y;
        if (pmdx * pmdx + pmdy * pmdy < 70 * 70) {
            playerMonster.fedCount++;
            l1FoodIndex++;
            if (l1FoodIndex >= l1NewFoodTypes.length) {
                monsterAteWolf = 1;
                monsterAteTimer = 0;
                l1CurrentFood.visible = 0;
                wrerthre = false;
                StrokeWeight1 = 0;
                // hide all level 2 monsters so they don't show when returning to forest
                for (var mhi = 0; mhi < monsters.length; mhi++) {
                    monsters[mhi].visible = 0;
                }
                angryMonster = -1;
            } else {
                l1CurrentFood.type = l1NewFoodTypes[l1FoodIndex];
                l1CurrentFood.x = floor(random(50, 320));
                l1CurrentFood.y = floor(random(310, 340));
                l1CurrentFood.visible = 1;
            }
        }
    }
    if (wareWolf) {
        if (draggingBtn === cookedFish) {
            var cfdx = cookedFish.x - 200; var cfdy = cookedFish.y - 180;
            if (cfdx * cfdx + cfdy * cfdy < 60 * 60) {
                wolfMessage = "The werewolf enjoyed the fish!"; wolfMessageTimer = 180;
                cookedFish.visible = 0; cookedFishDragging = 0; gameStage = 2;
                frogEmergeTimer = -90; frogEmerging = 0;
                frog.x = puddle.x + puddle.width * 0.5; frog.y = puddle.y + 4;
                frog.visible = 1; frog.caught = 0;
            }
        }
        if (draggingBtn === cookedFrog) {
            var cfrx = cookedFrog.x - 200; var cfry = cookedFrog.y - 180;
            if (cfrx * cfrx + cfry * cfry < 60 * 60) {
                wolfMessage = "The werewolf enjoys the frog legs!"; wolfMessageTimer = 180;
                cookedFrog.visible = 0; cookedFrogDragging = 0; gameStage = 3;
                nutsSpawned = 1; nutGrowth = 0; nuts = [];
                nuts.push({x:0,y:0,offsetX:-15,offsetY:10,onGround:0,width:12,height:14});
                nuts.push({x:0,y:0,offsetX:12,offsetY:5,onGround:0,width:12,height:14});
                nuts.push({x:0,y:0,offsetX:0,offsetY:-12,onGround:0,width:12,height:14});
                squirrelDelay = 0;
            }
        }
        if (draggingBtn === meat) {
            var meatdx = meat.x - 200; var meatdy = meat.y - 180;
            if (meatdx * meatdx + meatdy * meatdy < 60 * 60) {
                wolfMessage = "The werewolf gobbles the squirrel!"; wolfMessageTimer = 180;
                meat.visible = 0; gameStage = 4;
            }
        }
        if (draggingBtn === cookedNut) {
            var cndx = cookedNut.x - 200; var cndy = cookedNut.y - 180;
            if (cndx * cndx + cndy * cndy < 60 * 60) {
                wolfMessage = "The werewolf loves the roasted nut!"; wolfMessageTimer = 180;
                cookedNut.visible = 0; gameStage = 5; mushroomSpawnDelay = 0;
            }
        }
        if (draggingBtn === cookedMushroom) {
            var cmdx = cookedMushroom.x - 200; var cmdy = cookedMushroom.y - 180;
            if (cmdx * cmdx + cmdy * cmdy < 60 * 60) {
                wolfMessage = "The werewolf savors the mushroom!"; wolfMessageTimer = 180;
                cookedMushroom.visible = 0; cookedMushroomDragging = 0;
                gameStage = 6; cursedApple.visible = 1; cursedAppleGrowth = 0; cursedAppleDelay = 0;
            }
        }
        if (draggingBtn === cursedApple && cursedAppleGrowth >= 100) {
            var cadx = cursedApple.x - 200; var cady = cursedApple.y - 180;
            if (cadx * cadx + cady * cady < 60 * 60) {
                cursedApple.visible = 0; cursedAppleDragging = 0;
                if (random(1) < 0.5) {
                    wolfMessage = "The werewolf devours the cursed apple!"; wolfMessageTimer = 200;
                    gameStage = 7; bushGrowth = 0; bushGrowDelay = 0; moonberries = [];
                    moonberries.push({x:325,y:282,visible:1,width:16,height:16});
                    moonberries.push({x:340,y:275,visible:1,width:16,height:16});
                    moonberries.push({x:355,y:282,visible:1,width:16,height:16});
                    moonberriesSpawned = 1;
                } else {
                    wolfAngry = 1; wolfAngryTimer = 180;
                    wolfMessage = "The cursed apple made the werewolf ANGRY!"; wolfMessageTimer = 200;
                }
            }
        }
        if (draggingBtn === cursedApple) { cursedAppleDragging = 0; }
        for (var bi = 0; bi < moonberries.length; bi++) {
            var mb = moonberries[bi];
            if (draggingBtn === mb) {
                var mbdx = mb.x - 200; var mbdy = mb.y - 180;
                if (mbdx * mbdx + mbdy * mbdy < 60 * 60) {
                    mb.visible = 0; moonberriesFed++; moonberryAnimTimer = 60;
                    if (moonberriesFed >= 3) { wolfMessage = "The werewolf is still hungry"; wolfMessageTimer = 180; gameStage = 8; }
                    else { wolfMessage = "The werewolf wants more..."; wolfMessageTimer = 180; }
                }
                break;
            }
        }
        if (draggingBtn === smokedPaste) {
            var spdx = smokedPaste.x - 200; var spdy = smokedPaste.y - 180;
            if (spdx * spdx + spdy * spdy < 60 * 60) {
                wolfMessage = "The werewolf savors the smoked paste!"; wolfMessageTimer = 180;
                smokedPaste.visible = 0; smokedPasteDragging = 0; gameStage = 9; moonstoneSpawned = 0;
            }
        }
        if (draggingBtn === smokedPaste) { smokedPasteDragging = 0; }
        if (draggingBtn === crystalCandy) {
            var ccdx = crystalCandy.x - 200; var ccdy = crystalCandy.y - 180;
            if (ccdx * ccdx + ccdy * ccdy < 60 * 60) {
                wolfMessage = "The werewolf glitters with delight!"; wolfMessageTimer = 180;
                crystalCandy.visible = 0; crystalCandyDragging = 0;
                gameStage = 10; sun.x = 350; sun.y = 80;
            }
        }
        if (draggingBtn === crystalCandy) { crystalCandyDragging = 0; }
        if (draggingBtn === eclipseBerry) {
            var ebdx = eclipseBerry.x - 200; var ebdy = eclipseBerry.y - 180;
            if (ebdx * ebdx + ebdy * ebdy < 60 * 60) {
                wolfMessage = "The werewolf is TRULY satisfied!"; wolfMessageTimer = 300;
                eclipseBerry.visible = 0; eclipseBerryDragging = 0;
                gameStage = 11; arrowVisible = true; rainbowStarTimer = 120;
            }
        }
        if (draggingBtn === eclipseBerry) { eclipseBerryDragging = 0; }
    }
    if (draggingBtn === cookedFish) { cookedFishDragging = 0; }
    if (draggingBtn === cookedFrog) { cookedFrogDragging = 0; }
    if (draggingBtn === meat) { meatDragging = 0; }
    if (draggingBtn === cookedNut) { cookedNutDragging = 0; }
    if (draggingBtn === cookedMushroom) { cookedMushroomDragging = 0; }
    draggingBtn = -1;
};

var RainDrop = function(x, y) {
    this.x = x; this.y = y; this.speed = random(4, 8);
    this.splashed = 0;
};
RainDrop.prototype.update = function() {
    this.y += this.speed;
    if (!this.splashed && this.y > 292) {
        this.splashed = 1;
        if (random(1) < 0.3) { burst(this.x, 292, 120, 170, 255, 2, 1.2, 0.15); }
    }
};
RainDrop.prototype.draw = function() {
    strokeWeight(1); stroke(110, 150, 255, 200);
    line(this.x, this.y, this.x, this.y + 7);
};
var rainArea = {x: cloud.x - 48, y: cloud.y + 18, width: 92, height: 200};
var makeRainArea = function(x, y, w, h) {
    rainArea.x = x; rainArea.y = y; rainArea.width = w; rainArea.height = h;
};
var spawnRain = function() {
    drops.push(new RainDrop(random(rainArea.x, rainArea.x + rainArea.width), rainArea.y));
};
var rainHittingHole = function() {
    if (!holeFilled) { return false; }
    for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        if (abs(d.x - holeX) < 20 && abs(d.y - holeY) < 20) { return true; }
    }
    return false;
};

// ============ LEVEL 1 DETAIL HELPERS ============
var drawNightStars = function() {
    var a = constrain(map(skyB, 30, 200, 255, 0), 0, 255);
    if (a <= 5) { return; }
    noStroke();
    for (var i = 0; i < nightStars.length; i++) {
        var s = nightStars[i];
        var tw = 0.55 + 0.45 * sin(frameCount * 2 + s.p);
        fill(255, 255, 230, a * tw);
        ellipse(s.x, s.y, s.s, s.s);
        if (s.s > 2.3) {
            fill(255, 255, 255, a * tw * 0.25);
            ellipse(s.x, s.y, s.s * 3.5, s.s * 3.5);
        }
    }
    // the odd shooting star
    var ss = frameCount % 600;
    if (ss < 40) {
        var startX = 150 + (floor(frameCount / 600) * 97) % 240;
        var sx = startX - ss * 6;
        var sy = 20 + ss * 2.5;
        stroke(255, 255, 255, a * (1 - ss / 40));
        strokeWeight(2);
        line(sx, sy, sx + 22, sy - 9);
        noStroke(); strokeWeight(1);
    }
};
var drawL1Ground = function() {
    noStroke();
    fill(27, 181, 0); rect(0, 291, 400, 30);
    fill(22, 150, 0); rect(0, 300, 400, 8);
    fill(71, 33, 0); rect(0, 308, 400, 100);
    fill(62, 28, 0); rect(0, 340, 400, 60);
    fill(52, 23, 0); rect(0, 372, 400, 28);
    for (var p = 0; p < soilPebbles.length; p++) {
        var pb = soilPebbles[p];
        fill(pb.c, pb.c * 0.7, pb.c * 0.45);
        ellipse(pb.x, pb.y, pb.w, pb.w * 0.7);
        fill(255, 255, 255, 25);
        ellipse(pb.x - pb.w * 0.2, pb.y - pb.w * 0.15, pb.w * 0.4, pb.w * 0.25);
    }
    strokeWeight(1);
    for (var g = 0; g < l1Grass.length; g++) {
        var gr = l1Grass[g];
        var sway = sin(frameCount * 2 + gr.x * 3) * 1.5;
        stroke(30, gr.g, 10);
        line(gr.x, 293, gr.x + sway, 293 - gr.h);
    }
    noStroke();
};
var drawWolfExtras = function() {
    // 0 = human, 1 = full werewolf
    var t = constrain((148 - Col.col3) / 148, 0, 1);
    if (t <= 0.02) { return; }
    noStroke();
    // cheek ruff around the lower head
    fill(Col.col1, Col.col2, Col.col3, 255 * t);
    for (var a = 20; a <= 160; a += 28) {
        var bx = 200 + cos(a) * 22; var by = 100 + sin(a) * 22;
        var tx = 200 + cos(a) * (22 + 10 * t); var ty = 100 + sin(a) * (22 + 10 * t);
        triangle(bx + sin(a) * 5, by - cos(a) * 5, bx - sin(a) * 5, by + cos(a) * 5, tx, ty);
    }
    // body fur tufts
    fill(Col2.col1, Col2.col2, Col2.col3, 255 * t);
    for (var yy = 130; yy < 212; yy += 14) {
        triangle(179, yy, 179, yy + 10, 179 - 7 * t, yy + 3);
        triangle(222, yy, 222, yy + 10, 222 + 7 * t, yy + 3);
    }
    // claws
    stroke(240, 240, 225, 255 * t); strokeWeight(1.5);
    line(148, 225, 144, 233); line(150, 226, 149, 234); line(152, 225, 154, 233);
    line(253, 225, 249, 233); line(255, 226, 255, 234); line(257, 225, 260, 233);
    line(225, 289, 221, 295); line(227, 289, 229, 295);
    line(179, 287, 175, 293); line(181, 287, 183, 293);
    noStroke(); strokeWeight(1);
    // glowing eyes
    fill(255, 40, 20, 55 * t);
    ellipse(190, 100, 14, 26);
    ellipse(209, 101, 14, 26);
    fill(255, 90, 40, 210 * t);
    ellipse(189.5, 97, 3, 6);
    ellipse(209, 97, 3, 6);
};
var drawMoonDetailed = function(x, y) {
    noStroke();
    fill(220, 230, 255, 22); ellipse(x, y, 115, 115);
    fill(230, 235, 255, 40); ellipse(x, y, 80, 80);
    fill(245, 245, 235); ellipse(x, y, 50, 50);
    fill(215, 215, 205);
    ellipse(x - 8, y - 6, 12, 10);
    ellipse(x + 9, y + 7, 9, 8);
    ellipse(x + 6, y - 11, 6, 5);
    ellipse(x - 9, y + 10, 7, 6);
    fill(198, 198, 188);
    ellipse(x - 7, y - 5, 6, 5);
    ellipse(x + 10, y + 8, 4, 4);
    fill(255, 255, 255, 120);
    ellipse(x - 10, y - 13, 10, 6);
};
var drawSunDetailed = function(x, y) {
    noStroke();
    fill(255, 230, 80, 28); ellipse(x, y, 125, 125);
    fill(255, 240, 100, 45); ellipse(x, y, 85, 85);
    stroke(255, 220, 60, 170); strokeWeight(3);
    for (var a = 0; a < 360; a += 30) {
        var aa = a + frameCount * 0.5;
        var len = (a % 60 === 0) ? 44 : 38;
        line(x + cos(aa) * 30, y + sin(aa) * 30, x + cos(aa) * len, y + sin(aa) * len);
    }
    noStroke(); strokeWeight(1);
    fill(255, 255, 0); ellipse(x, y, 50, 50);
    fill(255, 255, 170); ellipse(x - 6, y - 6, 26, 26);
};

var drawScene = function() {
    if (level === 10) { drawLevel10(); return; }
    if (level === SECRET_LEVEL) { drawSecretRoute(); return; }
    if (level === RAIN_LEVEL) { drawRainEnding(); return; }
    if (level === TRES_LEVEL) { drawTresEnding(); return; }
    if (level === 9) { drawLevel9(); return; }
    if (level === 8) { drawLevel8(); return; }
    if (level === 7) { drawLevel7(); return; }
    if (level === 6) { drawLevel6(); return; }
    if (level === 5) { drawLevel5(); return; }
    if (level === 4) { drawLevel4(); return; }
    if (level === 3) {
        drawLevel3();
        return;
    }
    if (level === 2) {
        drawLevel2Forest();
        return;
    }
    background(skyR, skyG, skyB);
    drawNightStars();
    if (eclipseActive) { drawEclipse(); }
    if (wolfAngry && wolfAngryTimer > 0) {
        wolfAngryTimer--;
        wolfShakeX = floor(random(-4, 4));
        noStroke(); fill(255, 0, 0, 40); rect(0, 0, 400, 400);
        if (wolfAngryTimer <= 0) {
            wolfAngry = 0; wolfShakeX = 0;
            cursedApple.visible = 1; cursedAppleGrowth = 0; cursedAppleDelay = 0;
        }
    }
    translate(wolfShakeX, 0);
    stroke(0); strokeWeight(1);
    if (wrerthre){
        lupin(); ear1(); ear2();
        drawWolfExtras();
    }
    drawL1Ground();
    drawHole();
    drawPuddle();
    drawFishingLine();
    drawRawFish();
    drawCookedFish();
    drawFrog();
    drawCookedFrog();
    drawTree();
    drawCursedApple();
    drawNuts();
    drawNutPaste();
    drawMushrooms();
    drawMoonberryBush();
    drawMoonstone();
    drawCrystalCandy();
    drawEclipseBerry();
    drawSquirrel();
    drawMeat();
    drawShovel();
    drawL1NewFood();
    drawPlayerMonster();
    drawGoToForestButtonL1();
    fill(0, 0, 0, Trans); noStroke();
    rect(0, 0, 400, 291);
    fill(0, 0, 0, Trans2);
    rect(0, 291, 400, 18);
    drawSunDetailed(sun.x, sun.y);
    if (moon.y > -60) { drawMoonDetailed(moon.x, moon.y); }
    if (eclipseActive) {
        fill(255, 220, 0); noStroke(); ellipse(sun.x, sun.y, 50, 50);
        fill(40, 10, 0); ellipse(sun.x, sun.y, 44, 44);
        noFill(); stroke(255, 170, 40, 200); strokeWeight(3);
        ellipse(sun.x, sun.y, 52, 52);
        noStroke(); strokeWeight(1);
    }
    if (moonOffScreen && moon.y > -60) { moon.y -= 5; }
    drawSeed();
    if (leavesDetached) { drawL1Leaves(); }
    drawCloud();
    drawSecretL1();
    drawRainbowStars();
    if (!isCloudCoveringMoon() && !moonOffScreen && !dayTime) { wareWolf = true; }
    if (wolfMessageTimer > 0) {
        wolfMessageTimer--;
        noStroke();
        var mAlpha = min(200, wolfMessageTimer * 8);
        if (wolfAngry) { fill(255, 80, 80, mAlpha); } else { fill(255, 220, 100, mAlpha); }
        rect(20, 150, 360, 30);
        fill(0, 0, 0, mAlpha * 1.2); textSize(13); textAlign(CENTER);
        text(wolfMessage, 200, 170);
    }
    if (wareWolf) {
        if (Col.col3 >= 0){ Col.col3--; }
        if (Col.col2 >= 49){ Col.col2--; }
        if (Col.col1 >= 77){ Col.col1--; }
        if (Col2.col3 >= 0){ Col2.col3--; }
        if (Col2.col2 >= 49){ Col2.col2--; }
        if (Col2.col1 >= 77){ Col2.col1--; }
        if (eyeCol.r <= 255){ eyeCol.r++; }
        if (noseEndx <= 250){ noseEndx += 0.3; }
        if (StrokeWeight1 < 10){ StrokeWeight1 += 0.1; }
        strokeWeight(StrokeWeight1); stroke(0);
        point(noseEndx - 5, noseEndy);
        if (ear1End >= 60){ ear1End -= 0.3; }
        if (ear2End >= 60){ ear2End -= 0.3; }
        if (Trans >= 0){ Trans--; }
    }
    if (dayTime) {
        if (skyR > 0){ skyR--; }
        if (skyG < 225){ skyG++; }
        if (skyB < 255){ skyB++; }
        if (Trans >= 0){ Trans--; }
        if (Trans2 >= 0){ Trans2--; }
        if (sun.x === 300){ sunThereYet = true; }
        if (sun.x >= 300 && gameStage < 10){ sun.x--; }
        if (Col.col1 <= 255){ Col.col1++; }
        if (Col.col2 <= 221){ Col.col2++; }
        if (Col.col3 <= 148){ Col.col3++; }
        if (Col2.col1 <= 150){ Col2.col1++; }
        if (Col2.col2 <= 150){ Col2.col2++; }
        if (Col2.col3 <= 150){ Col2.col3++; }
        if (eyeCol.r > 0){ eyeCol.r--; }
        if (noseEndx > 206){ noseEndx -= 0.3; }
        if (ear1End <= 82){ ear1End += 0.3; }
        if (ear2End <= 82){ ear2End += 0.3; }
        if (Trans <= 140){ Trans++; }
        if (StrokeWeight1 > 0){ StrokeWeight1 -= 0.1; }
    }
    if (dayTime && cloud.y > 0 && sunThereYet && !treeGrown) { itRaining = true; }
    if (treeGrown) {
        itRaining = false;
        if (!puddle.visible) { puddle.visible = 1; puddleSize = 0; gameStage = 1; }
    }
    if (itRaining) {
        makeRainArea(cloud.x - 48, cloud.y + 18, 92, 200);
        if (frameCount % 2 === 0) { spawnRain(); }
    }
    strokeWeight(1);
    for (var i = 0; i < drops.length; i++) {
        var d = drops[i]; d.update(); d.draw();
        if (d.y > height) { drops.splice(i, 1); i--; }
    }
    if (holeFilled && seedBuried && rainHittingHole()) {
        if (treeGrowth < 100) { treeGrowth += 0.3; }
    }
    if (treeGrowth >= 100 && !treeGrown) { treeGrown = true; drops = []; }
    if (gameStage === 3 && !squirrelActive && nutGrowth >= 80) {
        squirrelDelay++;
        if (squirrelDelay > 120) {
            squirrelActive = 1; squirrel.x = -40;
            squirrel.alive = 1; squirrel.burning = 0;
        }
    }
    if (frog.visible && !frog.caught && frogEmergeTimer < 0) {
        frogEmergeTimer++;
        if (frogEmergeTimer >= 0) { frogEmerging = 1; }
    }
    updateSquirrel();
    updateFishing();
    updateFrog();
    updateNutGrowth();
    updateMushroomGrowth();
    updateCursedAppleGrowth();
    updateBushGrowth();
    updateEclipse();
    updateMoonstoneSpawn();
    translate(-wolfShakeX, 0);
    if (keyIsPressed && keyCode === RIGHT) { shovel.x = 200; }
    if (keyIsPressed && keyCode === LEFT && !dayTime) { moon.x -= 2; }
};

// ============ EVENT WATCHER (effects without touching game logic) ============
var ev = {
    level: 1, stage: 0, berries: 0, angry: 0, fire: false, hole: false, seed: false,
    filled: false, grown: false, cooked: 0, pmFed: 0, ateWolf: 0,
    birdDead: 0, nest: 0, eggClicks: 0, hatched: 0, foxClicks: 0, foxCorpse: 0,
    monsters: 0, fstage: 0, fallen: 0, leavesGone: 0,
    pot: 0, rocks: 0, cages: 0, bossHP: 240, bossDead: 0, portal: 0,
    key: ""
};
var countCooked = function() {
    return cookedFish.visible + cookedFrog.visible + cookedNut.visible + cookedMushroom.visible +
           smokedPaste.visible + crystalCandy.visible;
};
var checkEvents = function() {
    // level fade-in
    if (level !== ev.level) { fadeAmt = 255; ev.level = level; }

    // ---- level 1 ----
    if (gameStage > ev.stage && gameStage >= 2) {
        burst(200, 180, 255, 210, 90, gameStage === 11 ? 80 : 28, 3.5, 0.02);
        if (gameStage === 11) { flash(255, 240, 180, 120); shake(5); }
    }
    ev.stage = gameStage;
    if (moonberriesFed > ev.berries) { burst(200, 180, 190, 90, 255, 22, 3, 0.02); }
    ev.berries = moonberriesFed;
    if (wolfAngry && !ev.angry) { shake(7); flash(255, 0, 0, 70); }
    ev.angry = wolfAngry;
    if (leavesOnFire && !ev.fire) { burst(leaves.x + 20, leaves.y + 10, 255, 140, 20, 26, 3, -0.03); flash(255, 150, 40, 40); }
    ev.fire = leavesOnFire;
    if (holeExists && !ev.hole) { burst(holeX, holeY, 110, 60, 10, 18, 2.5, 0.15); }
    ev.hole = holeExists;
    if (seedBuried && !ev.seed) { burst(holeX, holeY, 110, 60, 10, 8, 1.5, 0.15); }
    ev.seed = seedBuried;
    if (holeFilled && !ev.filled) { burst(holeX, holeY, 110, 60, 10, 18, 2.5, 0.15); }
    ev.filled = holeFilled;
    if (treeGrown && !ev.grown) { burst(holeX, holeY - 80, 70, 200, 70, 36, 3, 0.05); }
    ev.grown = treeGrown;
    var ck = countCooked();
    if (ck > ev.cooked) { burst(mouseX, mouseY, 255, 150, 40, 14, 2, -0.05); burst(mouseX, mouseY, 150, 150, 150, 8, 1.2, -0.06); }
    ev.cooked = ck;
    if (playerMonster.fedCount > ev.pmFed) {
        burst(playerMonster.x, playerMonster.y, playerMonster.r, playerMonster.g, playerMonster.b, 24, 3, 0);
        shake(2);
    }
    ev.pmFed = playerMonster.fedCount;
    if (monsterAteWolf && !ev.ateWolf) {
        shake(10); flash(150, 20, 200, 110);
        burst(200, 160, 180, 40, 255, 60, 4, 0.03);
    }
    ev.ateWolf = monsterAteWolf;

    // ---- level 2 ----
    if (bird.dead && !ev.birdDead) { burst(bird.x, bird.y, 180, 120, 60, 14, 2.5, 0.12); shake(2); }
    ev.birdDead = bird.dead;
    if (nestRevealed && !ev.nest) { burst(nestX, nestY - 8, 50, 130, 50, 20, 2.5, 0.1); }
    ev.nest = nestRevealed;
    var ec = 0; var hc = 0;
    for (var ei = 0; ei < eggs.length; ei++) { ec += eggs[ei].clicks; hc += eggs[ei].hatched; }
    if (hc > ev.hatched) { burst(mouseX, mouseY, 255, 240, 200, 18, 2.5, 0.1); }
    else if (ec > ev.eggClicks) { burst(mouseX, mouseY, 230, 215, 170, 5, 1.5, 0.15); }
    ev.eggClicks = ec; ev.hatched = hc;
    if (fox.clicks > ev.foxClicks) { burst(mouseX, mouseY, 255, 60, 40, 6, 2, 0.1); shake(1.5); }
    ev.foxClicks = fox.clicks;
    if (fox.corpse && !ev.foxCorpse) { shake(4); }
    ev.foxCorpse = fox.corpse;
    var mv = 0;
    for (var mi = 0; mi < monsters.length; mi++) { mv += monsters[mi].visible; }
    if (level === 2 && mv < ev.monsters && angryMonster >= 0) {
        burst(monsters[angryMonster].x, monsters[angryMonster].y, 200, 30, 90, 30, 3.5, 0.05);
        shake(6);
    }
    ev.monsters = mv;
    if (forestStage === 10 && ev.fstage !== 10) { flash(180, 50, 255, 90); }
    ev.fstage = forestStage;
    if (treeSmashing && treeSmashTimer < 30) { shake(2.5); }
    if (treeFallen && !ev.fallen) {
        shake(12);
        burst(treeX + 130, 305, 130, 110, 80, 40, 3.5, 0.1);
        burst(treeX + 60, 308, 130, 110, 80, 20, 2.5, 0.1);
        burst(treeX + 130, 300, 60, 150, 60, 20, 3, 0.1);
    }
    ev.fallen = treeFallen;
    var lg = 0;
    for (var li = 0; li < groundLeaves.length; li++) { lg += groundLeaves[li].removed; }
    if (lg > ev.leavesGone) { burst(mouseX, mouseY, 160, 110, 30, 8, 2, 0.12); }
    ev.leavesGone = lg;
    if (level === 2 && magicDoorVisible && frameCount % 6 === 0) {
        burst(treeX - 10 + random(-14, 14), 290, 210, 140, 255, 1, 0.6, -0.03);
    }

    // ---- level 3 ----
    if (cavePotContents.length > ev.pot) { burst(cavePot.x, cavePot.y - 10, 200, 100, 255, 20, 2.5, -0.02); }
    ev.pot = cavePotContents.length;
    var rk = 0; var cg = 0;
    for (var ci = 0; ci < caveCritters.length; ci++) { rk += caveCritters[ci].rockRemoved; cg += caveCritters[ci].cageOpen; }
    if (rk > ev.rocks) { burst(mouseX, mouseY, 110, 100, 90, 12, 2.5, 0.15); shake(1.5); }
    if (cg > ev.cages) { burst(mouseX, mouseY, 190, 150, 230, 10, 2, 0.1); }
    ev.rocks = rk; ev.cages = cg;
    if (bossAlive && !bossDead && bossHP < ev.bossHP - 2) {
        burst(bossX + random(-30, 30), bossY + random(-20, 20), 255, 120, 255, 8, 3, 0);
    }
    ev.bossHP = bossHP;
    if (bossDead && !ev.bossDead) { shake(14); flash(255, 200, 255, 150); }
    ev.bossDead = bossDead;
    if (l3Portal && !ev.portal) { flash(200, 120, 255, 100); }
    ev.portal = l3Portal;

    // ---- stuck detection (resets whenever anything meaningful changes) ----
    var key = level + "," + gameStage + "," + holeExists + seedBuried + holeFilled + treeGrown +
        dayTime + wareWolf + leavesOnFire + "," + floor(treeGrowth / 10) + "," +
        fishingLine.active + fishOnHook + rawFish.visible + frog.caught + ck + nuts.length +
        nutPaste.visible + mushrooms.length + moonberriesFed + moonstone.visible + eclipseBerry.visible +
        playerMonster.fedCount + monsterAteWolf + "," + forestStage + worm.visible + rock.visible +
        ec + fox.clicks + lg + mv + treeFallen + magicDoorVisible + "," + caveRoom + "," +
        cavePotContents.length + rk + cg + bossHP + l3Portal + "," + l4Piece.moved + l4Bomb.lit +
        l4Bomb.exploded + l4Safe.open + l4Keypad.open + l4Keypad.entry + l4ScrewsLeft() + l4Plate.off + l4T.moved + l4E.moved +
        l4E.attached + l4E.rot + l4Hammer.made + l4Crack.broken + "," + l5Pixel.stuck +
        l5Cap.broken + floor(l5Cap.hp / 30) + l5Done + l5Phase + l5Shovel.held + l5Shovel.used + "," + l6Phase + l6Cracks.length + l6Lamp +
        l6Mug.spilled + l6Drawer.open + l6Usb.inPort + l6Laptop.ready + (draggingBtn === l6Key) + (draggingBtn === l6Usb) + "," + l7Coin.where + l7Credit + l7Hanger.fished +
        l7Manual.where + l7Manual.read + l7Seq.length + l7Entry + l7Aval.on + l7Aval.done + "," + l8Phase + l8DoorOpen +
        l8Name.join("") + l8SpeedFixed + l8LoopFixed + l8Runs + "," + l9Scene + l9Inv.join("") + l9Powered +
        l9Door.locked + l9Door.open + l9Keypad.open + l9Keypad.entry + l9Lit + l9Rex.state + l9Duck.on + l9Exit.batteries + l9LettersOut() +
        l9Fuse.open + l9Fuse.found + l9Power + l9StageOpen + l9Clip + l9MarkWith("") + l9RexStage.on + l9Squeak.t + (l9Held.type !== "") + l9Vend.plugged + l9Vend.credit + l9Vend.keypad + l9Vend.seq.length + l9Vend.dumped + l9Vend.hop +
        l9Fox.state + l9Bird.state + l9Seed.on + l9Beast.state + l9Celery.on + "|" + srStuckKey() + l9Rain.door + l9Rain.guppy + l9Rain.met + l9Rain.hole + l9Rain.lit + l9Rain.fish + l9Rain.fishOn + (l9Rain.storm > 0) + l9Rain.hanger + l9Rain.ladder + l9Rain.bulb + l9Rain.box + l9Rain.spare + l9Rain.sky + floor(l9Rain.altarX / 20) + floor(l9Rain.fill / 25) + l9Rain.gems + l9Rain.puddleGem + l9Rain.sun + l9Rain.lock.join("") + l9Rain.trunk + l9Vault.door + l9Vault.room + l9Vault.solved + l9Vault.wheel + l9Vault.dial.join("") + l9Vault.grid.join("") + l9Vault.tiles.join("") + (rainEnd.phase || 0) + (rainEnd.hp || 0);
    if (key !== ev.key) { ev.key = key; stuckTimer = 0; }
    else { stuckTimer++; }
};

// ============ QUIET HINTS: where would a glint help right now? ============
var getHintTargets = function() {
    var t = [];
    var i;
    if (level === SECRET_LEVEL) { return srHints(); }
    if (level === 1) {
        // [x, y] = glint, [x1, y1, x2, y2] = "drag this to there" line
        var fireX = leaves.x + 20; var fireY = leaves.y + 10;
        var WX = 200; var WY = 180; // where the werewolf eats
        if (goToForestButton) { t.push([47, 385]); return t; }
        if (!holeExists) { t.push([shovel.x + 16, shovel.y, 200, 300]); return t; }
        if (!seedBuried) { t.push([seed.x, seed.y, holeX, holeY]); return t; }
        if (!holeFilled) { t.push([shovel.x + 16, shovel.y, holeX + 1, holeY]); return t; }
        if (!treeGrown) {
            if (!dayTime && wareWolf) { t.push([moon.x, moon.y]); }
            else if (abs(cloud.x - holeX) > 20) { t.push([cloud.x, cloud.y, holeX, cloud.y]); }
            else { t.push([cloud.x, cloud.y]); }
            return t;
        }
        if (arrowVisible && !monsterAteWolf && gameStage >= 11) {
            t.push([holeX, holeY - treeGrowth * 0.8 - 24]);
        }
        // raw things that need cooking on the burning leaves
        var raw = [];
        if (rawFish.visible) { raw.push([rawFish.x, rawFish.y]); }
        if (frog.visible && frog.caught) { raw.push([frog.x, frog.y]); }
        if (gameStage === 4 && !cookedNut.visible) {
            for (i = 0; i < nuts.length; i++) { raw.push([nuts[i].x, nuts[i].y]); }
        }
        if (gameStage === 5 && !cookedMushroom.visible) {
            for (i = 0; i < mushrooms.length; i++) {
                if (mushrooms[i].growth >= 100) { raw.push([mushrooms[i].x + 8, mushrooms[i].y]); }
            }
        }
        if (nutPaste.visible) { raw.push([nutPaste.x + 7, nutPaste.y]); }
        if (moonstone.visible && !dayTime) { raw.push([moonstone.x + 7, moonstone.y]); }
        var squirrelToBurn = gameStage === 3 && squirrelActive && squirrel.alive && !squirrel.burning;
        if (raw.length > 0 || squirrelToBurn) {
            if (!leavesOnFire) {
                if (dayTime && sun.x < 380) { t.push([fireX, fireY, sun.x, sun.y]); }
                else { t.push([fireX, fireY]); }
            } else {
                for (i = 0; i < raw.length; i++) { t.push([raw[i][0], raw[i][1], fireX, fireY]); }
                if (squirrelToBurn) { t.push([fireX, fireY, squirrel.x, squirrel.y]); }
            }
        }
        // cooked things the werewolf wants
        var ready = [];
        var cooked = [cookedFish, cookedFrog, meat, cookedNut, cookedMushroom, crystalCandy];
        for (i = 0; i < cooked.length; i++) {
            if (cooked[i].visible) { ready.push([cooked[i].x, cooked[i].y]); }
        }
        if (smokedPaste.visible) { ready.push([smokedPaste.x + 7, smokedPaste.y]); }
        if (eclipseBerry.visible) { ready.push([eclipseBerry.x + 6, eclipseBerry.y]); }
        if (cursedApple.visible && cursedAppleGrowth >= 100 && !dayTime) { ready.push([cursedApple.x + 8, cursedApple.y + 8]); }
        if (!dayTime && bushGrowth >= 80) {
            for (i = 0; i < moonberries.length; i++) {
                if (moonberries[i].visible) { ready.push([moonberries[i].x, moonberries[i].y]); }
            }
        }
        if (ready.length > 0) {
            if (wareWolf) {
                for (i = 0; i < ready.length; i++) { t.push([ready[i][0], ready[i][1], WX, WY]); }
            } else if (dayTime) {
                t.push([sun.x, sun.y]); // he only eats at night
            } else {
                t.push([cloud.x, cloud.y]); // the cloud is hiding the moon
            }
        }
        // catching things
        if (frog.visible && catchWindowOpen && !frog.caught) { t.push([frog.x, frog.y]); }
        if (gameStage === 1 && puddle.visible && !fishingLine.active && !rawFish.visible && !fishCaught) {
            t.push([puddle.x + puddle.width * 0.5, puddle.y]);
        }
        if (fishingLine.active && fishOnHook) { t.push([fishingLine.x, fishingLine.hookY]); }
        // smoked paste: nut to the ground, then shovel onto it
        if (gameStage === 8 && !nutPaste.visible && !smokedPaste.visible) {
            for (i = 0; i < nuts.length; i++) {
                if (nuts[i].onGround) { t.push([shovel.x + 16, shovel.y, nuts[i].x + 1, nuts[i].y]); }
                else { t.push([nuts[i].x, nuts[i].y, nuts[i].x, 294]); }
            }
        }
        if (gameStage === 9 && !moonstoneSpawned && !dayTime) { t.push([moon.x, moon.y]); }
        if (gameStage === 10 && !eclipseBerry.visible && !dayTime) { t.push([sun.x, sun.y, moon.x, moon.y]); }
        // the purple monster's snacks
        if (playerMonster.visible && l1CurrentFood.visible && !monsterAteWolf) {
            t.push([l1CurrentFood.x, l1CurrentFood.y, playerMonster.x, playerMonster.y]);
        }
    } else if (level === 2) {
        if (returnToL1Button && !monsterAteWolf) { t.push([42, 385]); return t; }
        if (magicDoorVisible) { t.push([treeX - 10, 285]); return t; }
        if (monsterAteWolf) {
            if (!treeSmashing && !monsterZoomingToTree) { t.push([treeX, treeY]); }
            return t;
        }
        var lf;
        if (forestStage === 0) {
            lf = groundLeaves[wormLeaf];
            if (!worm.visible) { t.push([lf.x + lf.w * 0.5, lf.y]); } else { t.push([worm.x + 10, worm.y]); }
        } else if (forestStage === 1) {
            lf = groundLeaves[rockLeaf];
            if (!rock.visible) { t.push([lf.x + lf.w * 0.5, lf.y]); }
            else if (bird.state === 1) { t.push([rock.x, rock.y, bird.x, bird.y]); }
            else { t.push([rock.x, rock.y]); }
        } else if (forestStage === 2 && nestLeafsVisible) {
            t.push([nestX, nestY - 8]);
        } else if (forestStage === 3 || forestStage === 4) {
            for (i = 0; i < 3; i++) {
                if (!eggs[i].hatched) { t.push([eggs[i].x, eggs[i].y + EGG_DY]); }
            }
        } else if (forestStage === 6 || forestStage === 7) {
            t.push([fox.x, fox.y]);
        } else if (forestStage === 9) {
            var shown = false;
            for (i = 0; i < forestFoods.length; i++) {
                if (forestFoods[i].visible) {
                    // point at the first visible monster that still wants 2 snacks
                    var want = -1;
                    for (var mw = 0; mw < monsters.length; mw++) {
                        if (monsters[mw].visible && monsterFedCounts[mw] < 2) { want = mw; break; }
                    }
                    if (want >= 0 && angryMonster < 0) { t.push([forestFoods[i].x + 4, forestFoods[i].y, monsters[want].x, monsters[want].y]); }
                    else { t.push([forestFoods[i].x + 4, forestFoods[i].y]); }
                    shown = true;
                }
            }
            if (!shown) {
                for (i = 0; i < forestFoodLeaves.length; i++) {
                    lf = groundLeaves[forestFoodLeaves[i]];
                    if (!lf.removed) { t.push([lf.x + lf.w * 0.5, lf.y]); }
                }
            }
        }
    } else if (level === 9) {
        if (l9Scene === 2 || l9Keypad.open || l9Clip || l9Squeak.t >= 0) { return t; }
        var slotOf = function(type) {
            for (var si = 0; si < l9Inv.length; si++) { if (l9Inv[si] === type) { return [l9SlotX(si), L9_SLOT_Y]; } }
            return null;
        };
        var creditGlint = function(type) {
            if (l9Taken[type]) { return false; }
            for (var ci = 0; ci < l9Credits.length; ci++) {
                if (l9Credits[ci][2] === type) { var cp = l9CreditItemPos(ci); if (cp) { t.push([cp[0], cp[1]]); return true; } }
            }
            return false;
        };
        if (l9Held.type === "duck" && l9Scene === 1 && l9Rex.state !== "bone") { t.push([l9Held.x, l9Held.y, 80, 330]); return t; }
        if (l9Held.type !== "") { return t; }
        var fl = slotOf("flashlight"); var bt = slotOf("batteries");
        if (fl && bt) { t.push([bt[0], bt[1], fl[0], fl[1]]); return t; }
        var dk = slotOf("duck");
        if (l9Scene === 0) {
            if (l9Door.locked) {
                var ky = slotOf("key");
                if (ky) { t.push([ky[0], ky[1], L9_DOOR_X + 14, L9_DOOR_Y + 24]); return t; }
                creditGlint("key"); return t;
            }
            if (!l9Door.open) {
                if (dk) { t.push([dk[0], dk[1]]); t.push([L9_DOOR_X + 14, L9_DOOR_Y + 24]); }
                else { creditGlint("duck"); }
                return t;
            }
            if (!l9Lit && !l9Power && !l9Taken.flashlight) { creditGlint("flashlight"); return t; }
            if (l9StageOpen && l9Rex.state === "chewing" && !l9Taken.bone) { creditGlint("bone"); return t; }
            if (l9StageOpen && l9Fox.state === "hiding" && !l9Taken.sandwich) { creditGlint("sandwich"); return t; }
            if (l9Vend.plugged && !l9Vend.dumped && !l9Vend.credit && !l9Taken.coin) { creditGlint("coin"); return t; }
            t.push([L9_DOOR_X + 14, L9_DOOR_Y + 24]); return t;
        }
        if (l9Scene === 3) {
            if (l9Vend.keypad) {
                if (l9Vend.credit) {
                    var nx = L9_VCODE[min(l9Vend.seq.length, 3)];
                    var vbi = l9Vend.entry === "" ? "ABCD".indexOf(nx.charAt(0)) : 4 + "1234".indexOf(nx.charAt(1));
                    t.push([(vbi < 4 ? 150 : 210) + 20, 152 + (vbi % 4) * 32 + 13]);
                }
                return t;
            }
            var items = ["costume", "plush", "duck", "seed"];
            for (var ii = 0; ii < items.length; ii++) {
                var sl = slotOf(items[ii]);
                if (sl) { var fm = l9FreeMark(false); if (fm >= 0) { t.push([sl[0], sl[1], l9Marks[fm].x, l9Marks[fm].y]); } return t; }
            }
            if (l9Seed.on) { t.push([l9Seed.x, l9Seed.y]); return t; }
            if (l9Celery.on) { t.push([l9Celery.x, l9Celery.y]); return t; }
            var ce = slotOf("celery");
            if (ce && l9Beast.state === "under") { t.push([ce[0], ce[1], L9_TRAP_X, L9_TRAP_Y]); return t; }
            if (l9Vend.hop === 0) {
                if (!l9Vend.plugged) { t.push([l9Vend.plugX, l9Vend.plugY, L9_OUTLET_X, L9_OUTLET_Y]); return t; }
                if (!l9Vend.dumped && l9Power) {
                    var cn = slotOf("coin");
                    if (cn && !l9Vend.credit) { t.push([cn[0], cn[1], L9_VEND_X, L9_VEND_Y - 40]); return t; }
                    if (l9Vend.credit) { t.push([L9_VEND_X, L9_VEND_Y - 40]); return t; }
                }
            }
            if (l9MarkWith("duck") >= 0 && !l9RexStage.on && l9Rex.state === "bone") { var dmk = l9Marks[l9MarkWith("duck")]; t.push([dmk.x, dmk.y - 14]); return t; }
            if (l9CastReady()) { t.push([352, 248, 352, 330]); return t; }
            t.push([14, 150]); return t;
        }
        // backstage
        if (!l9Lit && !l9Power) {
            if (fl && l9Powered) { t.push([fl[0], fl[1], 200, 250]); }
            else if (l9Exit.batteries && fl) { t.push([60, 42]); }
            else { t.push([14, 200]); }
            return t;
        }
        if (l9RexBlocking() && !l9RexStage.on) {
            if (dk) { t.push([dk[0], dk[1], l9Rex.x + 26, l9Rex.y - 10]); }
            else if (l9Duck.on) { t.push([l9Duck.x, 356, 80, 330]); }
            else { t.push([14, 200]); }
            return t;
        }
        if (!l9Power) {
            if (l9LettersOut() < 3) {
                for (var lt = 0; lt < l9Letters.length; lt++) { if (!l9Letters[lt].out) { t.push([l9Letters[lt].x, l9Letters[lt].y]); break; } }
                return t;
            }
            if (!l9Fuse.found) { t.push([336, 280]); return t; }
            if (!l9Fuse.open) { t.push([370, 145]); return t; }
            var fu = slotOf("fuse");
            if (fu) { t.push([fu[0], fu[1], 370, 146]); }
            return t;
        }
        if (!l9StageOpen) { t.push([L9_LEVER_X + sin(l9Lever.ang) * 46, L9_LEVER_Y - cos(l9Lever.ang) * 46, 270, 320]); return t; }
        if (!l9Costume.taken) { t.push([70, 170]); return t; }
        if (l9Fox.state === "hiding") {
            var sw = slotOf("sandwich");
            if (sw) { t.push([sw[0], sw[1], 175, 100]); } else { t.push([192, 106]); }
            return t;
        }
        if (!l9Plush.taken) { t.push([262, 352]); return t; }
        if (l9Rex.state === "chewing") {
            var bn = slotOf("bone");
            if (bn) { t.push([bn[0], bn[1], l9Rex.x + 20, l9Rex.y]); } else { t.push([14, 200]); }
            return t;
        }
        if (l9Duck.on && !l9RexStage.on) { t.push([l9Duck.x, 356]); return t; }
        t.push([388, 206]);
    } else if (level === 8) {
        if (l8Phase === 1) { t.push([299, 247]); return t; }
        if (l8Phase === 5 && l8T > 60) { t.push([200, 196]); return t; }
        if (l8Phase !== 3 || l8Drag.id !== "") { return t; }
        if (l8Runs === 0) { t.push([359, 15]); return t; }
        var hit = function(id) {
            for (var hi = 0; hi < l8Hits.length; hi++) { if (l8Hits[hi].id === id) { return l8Hits[hi]; } }
            return null;
        };
        var A; var B;
        if (!l8DoorOpen) { A = hit("open"); B = hit("locked"); }
        else if (l8Name.join("") !== "walkThrough") {
            var want = "walkThrough".split("");
            for (var wi = 0; wi < want.length; wi++) {
                if (l8Name[wi] !== want[wi]) {
                    for (var wj = wi + 1; wj < want.length; wj++) { if (l8Name[wj] === want[wi]) { A = hit("L" + wj); B = hit("L" + wi); break; } }
                    break;
                }
            }
        }
        else if (!l8SpeedFixed) { A = hit("slash"); B = hit("line7"); }
        else if (!l8LoopFixed) { A = hit("hungry"); B = hit("true"); }
        else { t.push([359, 15]); return t; }
        if (A && B) { t.push([A.x + A.w / 2, A.y + 7, B.x + B.w / 2, B.y + 7]); }
    } else if (level === 7) {
        if (l7Manual.open || (l7Aval.on && !l7Aval.done) || l7Vend.slot !== "") { return t; }
        if (l7Aval.done) { t.push([l7Bag.x, l7Bag.y]); return t; }
        if (l7Coin.where === "under") { t.push([l7Hanger.x, l7Hanger.y + 14, 168, 352]); return t; }
        if (l7Credit === 0 && (l7Coin.where === "floor" || l7Coin.where === "cup")) {
            t.push([l7Coin.x, l7Coin.y, L7_SLOT_X, L7_SLOT_Y]); return t;
        }
        if (l7Credit > 0) {
            if (l7Manual.where === "top") { t.push([l7Hanger.x, l7Hanger.y + 14, 112, 40]); return t; }
            if (!l7Manual.read) { t.push([l7Manual.x, l7Manual.y]); return t; }
            var nxt = L7_CODE[min(l7Seq.length, L7_CODE.length - 1)];
            var bi = l7Entry === "" ? "ABCD".indexOf(nxt.charAt(0)) : 4 + "1234".indexOf(nxt.charAt(1));
            t.push([(bi < 4 ? 228 : 254) + 11, 96 + (bi % 4) * 18 + 7]);
        }
    } else if (level === 6) {
        if (l6Phase === 0) { t.push([200, 200]); return t; }
        if (l6Phase !== 3) { return t; }
        if (!l6Lamp) { t.push([34, 236]); return t; }
        if (l6Laptop.ready) { t.push([310, 150]); return t; }
        if (l6Usb.inPort) { return t; }
        if (l6Drawer.open) {
            var hux = l6Usb.x === 0 ? 200 : l6Usb.x; var huy = l6Usb.x === 0 ? 358 + l6Drawer.slide * 0.4 : l6Usb.y;
            t.push([hux, huy, 384, 203]); return t;
        }
        if (l6Key.visible) { t.push([l6Key.x, l6Key.y, 200, 376]); return t; }
        t.push([l6Mug.x, l6Mug.y]);
    } else if (level === 5) {
        if (l5Phase === 4) { t.push([l5EnterW.x, l5EnterW.y - l5Cam]); return t; }
        if (l5Phase === 3) { return t; }
        if (l5Phase === 2) {
            if (l5Shovel.used) { return t; }
            if (l5Shovel.held || dist(l5Diver.x, l5Diver.y, l5Shovel.x, l5Shovel.y) < 95) {
                t.push([l5Shovel.x, l5Shovel.y - l5Cam, l5Plug.x - 10, l5Plug.y - l5Cam]);
            } else {
                t.push([l5Diver.x, l5Diver.y - l5Cam, l5Shovel.x, l5Shovel.y - l5Cam]);
            }
            return t;
        }
        if (l5Done) { return t; }
        if (l5Cap.broken) { return t; }
        if (l5Fill < 0.99) { return t; }
        if (l5Pixel.stuck) { t.push([l5Pixel.x + 3, l5Pixel.y, l5Pixel.x + 3, l5Pixel.y - 50]); return t; }
        t.push([l5Spin.x, l5Spin.y, L5_BX + L5_BW + 4, L5_BY + L5_BH / 2]);
    } else if (level === 4) {
        if (l4Keypad.open) { return t; } // the code is yours to figure out
        if (l4Plate.off) { if (l4Plate.fall > 40) { t.push([200, 200]); } return t; }
        if (!l4Piece.moved) { t.push([l4Piece.x + 25, l4Piece.y + 15]); return t; }
        if (!l4Bomb.exploded) {
            if (!l4Bomb.lit) {
                // pull it out into the open, then click it
                if (l4Bomb.y > 365) { t.push([l4Bomb.x, l4Bomb.y, 200, 320]); } else { t.push([l4Bomb.x, l4Bomb.y]); }
            }
            return t;
        }
        if (!l4Safe.open) {
            if (!l4Crack.broken) {
                l4LayoutLetters();
                if (l4Hammer.made) { t.push([l4Hammer.x, l4Hammer.y, l4Crack.x, l4Crack.y]); return t; }
                if (l4E.attached) { t.push([l4E.x, l4E.y]); return t; }
                var hE = l4E.moved ? [l4E.x, l4E.y] : l4LetterHome(2);
                var hT = l4T.moved ? [l4T.x, l4T.y] : l4LetterHome(0);
                t.push([hE[0], hE[1], hT[0], hT[1] - 26]); return t;
            }
            t.push([l4Safe.x, l4Safe.y]); return t;
        }
        for (var sw = 0; sw < l4Screws.length; sw++) {
            if (!l4Screws[sw].out) { t.push([l4Driver.x + 14, l4Driver.y - 14, l4Screws[sw].x + 14, l4Screws[sw].y - 14]); break; }
        }
    } else if (level === 3) {
        if (l3Portal === 1) { t.push([200, 200]); return t; }
        if (bossAlive || altarActivated) { return t; }
        var full = cavePotContents.length >= l3CritterTypes.length;
        if (full) {
            if (caveRoom < 3) { t.push([372, 200]); } else { t.push([cavePot.x, cavePot.y, altarX, altarY]); }
            return t;
        }
        var left = 0;
        for (i = 0; i < caveCritters.length; i++) {
            var c = caveCritters[i];
            if (c.room !== caveRoom || c.inPot || draggingBtn === c) { continue; }
            if (c.catchType === "rock" && !c.rockRemoved) { t.push([c.rockX + 8, c.rockY + 4]); left++; }
            else if (c.catchType === "cage" && !c.cageOpen) { t.push([c.cageX + 14, c.cageY + 16]); left++; }
            else if (c.catchType === "crack" && !c.emerged) { left++; }
            else if (cavePot.visible) { t.push([c.x, c.y, cavePot.x, cavePot.y - 8]); left++; }
            else { t.push([c.x, c.y]); left++; }
        }
        if (left === 0 && caveRoom < 3) { t.push([372, 200]); }
    }
    return t;
};

// ============ TYPE "cheater" = it tells you what to do (only for the SECRET stuff, not normal gameplay) ============
var CHEAT_SPIKES = ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"];
var CHEAT_SNAIL = ["RED", "BLUE", "YELLOW", "GREEN", "PURPLE", "ORANGE"];
var CHEAT_CAST = ["werewolf", "purple monster", "fox", "bird", "eyeball", "duck", "vending machine", "Rex", "Altar Beast"];
// glowworms: which worms to poke so they ALL light up (lights-out, solved with math)
var cheatWormPlan = function() {
    var n = SR_WN * SR_WN;
    var rows = [];
    for (var i = 0; i < n; i++) {
        var row = [];
        for (var j = 0; j < n; j++) {
            var ri = floor(i / SR_WN); var ci = i % SR_WN; var rj = floor(j / SR_WN); var cj = j % SR_WN;
            row.push((abs(ri - rj) + abs(ci - cj)) <= 1 ? 1 : 0);
        }
        row.push(1 - srWorms[i]);
        rows.push(row);
    }
    var where = [];
    var r = 0;
    for (var c = 0; c < n && r < n; c++) {
        var p = -1;
        for (var k = r; k < n; k++) { if (rows[k][c]) { p = k; break; } }
        if (p < 0) { continue; }
        var tmp = rows[p]; rows[p] = rows[r]; rows[r] = tmp;
        for (var k2 = 0; k2 < n; k2++) {
            if (k2 !== r && rows[k2][c]) { for (var m = c; m <= n; m++) { rows[k2][m] = rows[k2][m] ^ rows[r][m]; } }
        }
        where.push(c); r++;
    }
    var x = [];
    for (var z = 0; z < n; z++) { x.push(0); }
    for (var q = 0; q < where.length; q++) { x[where[q]] = rows[q][n]; }
    return x;
};
// the acorn tower: the next best move from wherever the acorns are now
var cheatHanoiNext = function() {
    var pos = [];
    for (var p = 0; p < 3; p++) { for (var i = 0; i < srHanoi.peg[p].length; i++) { pos[srHanoi.peg[p][i]] = p; } }
    var nextMove = function(d, target) {
        if (d < 0) { return null; }
        if (pos[d] === target) { return nextMove(d - 1, target); }
        var other = 3 - pos[d] - target;
        var r = nextMove(d - 1, other);
        if (r === null) { return [pos[d], target]; }
        return r;
    };
    return nextMove(4, 2);
};
// the toad's jugs: the shortest list of buttons (worked out by trying everything)
var cheatJugPlan = function() {
    var J = srJug;
    var start = J.a + "," + J.b;
    var prev = {}; prev[start] = ["", ""];
    var q = [[J.a, J.b]];
    var found = "";
    while (q.length > 0 && found === "") {
        var s = q.shift(); var a = s[0]; var b = s[1];
        if (a === J.goal || b === J.goal) { found = a + "," + b; break; }
        var pa = min(a, J.cb - b); var pb = min(b, J.ca - a);
        var nx = [[J.ca, b, "FILL A"], [a, J.cb, "FILL B"], [0, b, "EMPTY A"], [a, 0, "EMPTY B"], [a - pa, b + pa, "A >> B"], [a + pb, b - pb, "A << B"]];
        for (var i = 0; i < nx.length; i++) {
            var key2 = nx[i][0] + "," + nx[i][1];
            if (prev[key2] === undefined) { prev[key2] = [a + "," + b, nx[i][2]]; q.push([nx[i][0], nx[i][1]]); }
        }
    }
    var steps = [];
    var cur = found;
    while (cur !== "" && cur !== start && prev[cur]) { steps.unshift(prev[cur][1]); cur = prev[cur][0]; }
    return steps;
};
var cheatCache = {key: "", val: null};
// raindrop sort: the shortest list of pours (tries everything, up to a limit)
var cheatSortPlan = function() {
    var t0 = rainZone.tubes;
    var enc = function(t) { var k = ""; for (var i = 0; i < t.length; i++) { k += t[i].join("") + "|"; } return k; };
    var key0 = enc(t0);
    if (cheatCache.key === "sort" + key0) { return cheatCache.val; }
    var prev = {}; prev[key0] = ["", ""];
    var q = [t0]; var head = 0; var found = ""; var n = 0;
    while (head < q.length && n < 40000) {
        var t = q[head]; head++; n++;
        if (raSortDone(t)) { found = enc(t); break; }
        var k1 = enc(t);
        for (var a = 0; a < 6; a++) {
            for (var b = 0; b < 6; b++) {
                if (a === b) { continue; }
                var c = []; for (var z = 0; z < 6; z++) { c.push(t[z].slice(0)); }
                if (raPour(c, a, b) === 0) { continue; }
                var k2 = enc(c);
                if (prev[k2] === undefined) { prev[k2] = [k1, (a + 1) + " -> " + (b + 1)]; q.push(c); }
            }
        }
    }
    var steps = [];
    var cur = found;
    while (cur !== "" && cur !== key0) { steps.unshift(prev[cur][1]); cur = prev[cur][0]; }
    cheatCache = {key: "sort" + key0, val: found === "" ? null : steps};
    return cheatCache.val;
};
// gold cart: the next slide
var cheatRushNext = function() {
    var G = goldArea;
    var key0 = G.P.join(",");
    if (cheatCache.key === "rush" + key0) { return cheatCache.val; }
    var prev = {}; prev[key0] = null;
    var q = [G.P.slice(0)]; var head = 0; var found = null;
    while (head < q.length && head < 30000) {
        var P = q[head]; head++;
        if (P[0] === 4) { found = P; break; }
        for (var v = 0; v < G.V.length; v++) {
            for (var d = -1; d <= 1; d += 2) {
                if (!gaRushCan(G.V, P, v, d)) { continue; }
                var np = P.slice(0); np[v] += d;
                var k = np.join(",");
                if (prev[k] === undefined) { prev[k] = P.join(","); q.push(np); }
            }
        }
    }
    var res = null;
    if (found) {
        var cur = found.join(","); var steps = 0;
        while (prev[cur] !== null && prev[cur] !== key0) { cur = prev[cur]; steps++; }
        var nxt = cur.split(",");
        for (var v2 = 0; v2 < G.V.length; v2++) { if (parseInt(nxt[v2], 10) !== G.P[v2]) { res = [v2, parseInt(nxt[v2], 10) - G.P[v2], steps + 1]; } }
    }
    cheatCache = {key: "rush" + key0, val: res};
    return res;
};
// puddle hop: the shortest way home from where you are
var cheatHopPath = function() {
    var A = rainZone;
    var prev = []; for (var i = 0; i < 25; i++) { prev.push(-2); }
    prev[A.at] = -1; var q = [A.at];
    while (q.length > 0) {
        var u = q.shift();
        if (u === 24) { break; }
        for (var v = 0; v < 25; v++) { if (prev[v] === -2 && raHopOK(u, v)) { prev[v] = u; q.push(v); } }
    }
    var path = [];
    if (prev[24] === -2) { return path; }
    var cur = 24;
    while (cur !== A.at) { path.unshift(cur); cur = prev[cur]; }
    return path;
};
var cheatNormal = function(t) {
    t.lines = ["you're doing NORMAL gameplay right now.", "no cheating here! (use the hints instead)", "", "(this only helps with the SECRET stuff.)"];
};
// works out what to tell you, right now
var cheatHelp = function() {
    var t = {title: "", lines: [], grid: ""};
    var i;
    if (level === SECRET_LEVEL) {
        t.title = "SECRET ROUTE  S-" + srShowNum(srRoom) + "  " + SR_NAMES[srRoom];
        if (srExit && (srRoom < 10 || srRoom >= 12)) { t.lines = ["you already solved it!", "click the TUNNEL that opened up to go on."]; return t; }
        if (srRoom === 0) {
            t.lines = ["the GOLD TOOTH is pebble number " + (srTooth + 1) + " (its spot on the table, counting from the LEFT).",
                "1) talk to the mole.  2) weigh it at least once (pan + scale).", "3) drag pebble " + (srTooth + 1) + " onto the mole."];
        } else if (srRoom === 1) {
            t.lines = ["poke the worms marked with an X (any order).", "then ALL the worms will glow."];
            t.grid = "worms";
        } else if (srRoom === 2) {
            var order = [];
            for (i = srBat.seq.length - 1; i >= 0; i--) { order.push(CHEAT_SPIKES[srBat.seq[i]]); }
            t.lines = ["1) click the BAT so it plays its song.", "2) click the spikes in REVERSE order:"];
            t.lines.push(order.slice(0, 4).join(", ") + ",");
            t.lines.push(order.slice(4).join(", "));
            t.lines.push("(the spikes from left to right: red, orange, green, blue, purple)");
        } else if (srRoom === 3) {
            t.lines = ["click each root the number of times shown.", "(blank = leave it alone)"];
            t.grid = "pipes";
        } else if (srRoom === 4) {
            t.lines = ["click a critter = put it on the raft. click the beetle = cross.", "click the critter on the raft = get off.",
                "1) take the WORM over.  2) come back alone.", "3) take the CENTIPEDE over.  4) bring the WORM back.",
                "5) take the MUSHROOM over.  6) come back alone.", "7) take the WORM over. done!"];
        } else if (srRoom === 5) {
            if (srBeetles.st.length === 0) { srMakeBeetles(); }
            t.lines = ["only one beetle tells the truth...", "the way out is TUNNEL " + (srBeetles.safe + 1) + ".  click it!"];
        } else if (srRoom === 6) {
            if (srSud.cell.length === 0) { srMakeSudoku(); }
            t.lines = ["plant these mushrooms (click a patch to change it):"];
            t.grid = "sudoku";
        } else if (srRoom === 7) {
            var js = cheatJugPlan();
            t.lines = ["press these buttons in order:"];
            for (i = 0; i < js.length; i += 4) { t.lines.push(js.slice(i, i + 4).join("  ->  ")); }
        } else if (srRoom === 8) {
            var hn = cheatHanoiNext();
            if (srHanoi.held >= 0) { t.lines = ["put the acorn you're holding down first."]; }
            else if (hn) {
                t.lines = ["NEXT MOVE: the top acorn on stump " + (hn[0] + 1) + "  ->  stump " + (hn[1] + 1) + ".",
                    "(type cheater again after each move for the next one)", "", "the trick: the smallest acorn moves every OTHER move,",
                    "always going 1 -> 3 -> 2 -> 1..."];
            }
        } else if (srRoom === 9) {
            t.lines = ["the snail's secret code is:"];
            t.grid = "snail";
        } else if (srRoom === 12) {
            var ip = srIceBFS(srIce.at);
            if (!ip) { t.lines = ["click START OVER, then type cheater again."]; }
            else {
                var dn = []; var from = srIce.at;
                for (i = 0; i < ip.length; i++) {
                    var fr = floor(from / 9); var fc = from % 9; var tr = floor(ip[i] / 9); var tc = ip[i] % 9;
                    dn.push(tr < fr ? "UP" : (tr > fr ? "DOWN" : (tc < fc ? "LEFT" : "RIGHT"))); from = ip[i];
                }
                t.lines = ["slide in this order:"];
                for (i = 0; i < dn.length; i += 6) { t.lines.push(dn.slice(i, i + 6).join(", ")); }
            }
        } else if (srRoom === 13) {
            t.lines = ["follow the glowing path (from where you are now):"]; t.grid = "maze";
        } else if (srRoom === 14) {
            t.lines = ["click the seeds in this order (they're numbered 1 at the top, going clockwise):"];
            var co = []; for (i = 0; i < srClock.sol.length; i++) { co.push(srClock.sol[i] + 1); }
            t.lines.push(co.join(" -> "));
            if (srClock.cur >= 0) { t.lines.push("(click START OVER first if you already started)"); }
        } else if (srRoom === 10) {
            t.lines = ["the code right now is:  " + srDoor.code.join(" "), "click each dial until it shows that number.",
                "then click the knob under the door.", "(if you get it wrong, there's a NEW code. type cheater again.)"];
            if (srDoor.dark) { t.lines.push(""); t.lines.push("it's dark right now. wait for the light to come back."); }
        } else {
            t.lines = ["click the RAIN KEY to take it!", "then go to level 9 and look at the bottom-left of THE END card."];
        }
        return t;
    }
    if (level === 1 && (srPocket.clicks > 0 || srDrop.state > 0 || srCup.water > 0)) {
        t.title = "THE SECRET UNDERGROUND (level 1)";
        t.lines = [(srPocket.open ? "[X] " : "[  ] ") + "click the human's shirt pocket 5 times",
            (srCup.inPocket === 0 || srCup.water > 0 ? "[X] " : "[  ] ") + "take the cup out of the pocket",
            (srCup.water >= 1 ? "[X] " : "[  ] ") + "fill the cup at the puddle",
            (srCup.water >= 3 ? "[X] " : "[  ] ") + "put the cup on the BURNING leaves to boil it",
            (srDrop.state >= 1 ? "[X] " : "[  ] ") + "the steam cloud rains down one big drop",
            (srDrop.state >= 3 ? "[X] " : "[  ] ") + "click the KEYHOLE the drop made"];
        return t;
    }
    if (level === 4 && !l4KeyGot && (l4K.out || l4Y.out || l4Word.formed)) {
        t.title = "THE WORD KEY (level 4)";
        t.lines = ["the K is carved in the LEFT black border, the Y in the RIGHT one.", "1) drag them out.",
            "2) drop them both on the E in THE END (before you unscrew the sign).", "3) click the word KEY.  4) click the real key to take it.",
            "it opens the tiny door in the top-left of level 9's THE END card."];
        return t;
    }
    if (level === 9) {
        if (l9Scene === 6) {
            var V = l9Vault;
            t.title = "THE LETTER VAULT";
            if (V.solved && V.room < 6) { t.lines = ["solved! click the  >  on the right."]; return t; }
            if (V.room === 0) { t.lines = ["the password is:  " + V.pass, "click the arrows on the dials to spell it, then UNLOCK."]; }
            else if (V.room === 1) { t.lines = ["fill in these squares (it's " + L9_PIC_NAMES[V.pic] + "):"]; t.grid = "pic"; }
            else if (V.room === 2) {
                l9SlideHelp.shown = 1;
                t.lines = ["a TELL ME WHAT TO DO button just showed up", "under the tiles. click it, and it glows the", "next tile to slide, every time."];
            }
            else if (V.room === 3) { t.lines = ["the K's and Y's go like this:"]; t.grid = "ky"; }
            else if (V.room === 4) { t.lines = ["the letters go like this:"]; t.grid = "abc"; }
            else if (V.room === 5) { t.lines = ["one ladder that works:", vtLadderPath().join("  >  ")]; }
            else { t.lines = l9Tres.got ? ["you already got Tres!", "now: on the stage, with the whole cast ready,", "pull the curtain rope to the RIGHT."] : ["click the chest, then click Tres."]; }
            return t;
        }
        if (l9Scene === 7) {
            tresGenerate();
            var T = l9Tres;
            t.title = "THE TREASURE ROOM";
            if (T.panel === "box") { t.lines = ["CUPS: " + T.cnt[0] + "    GEMS: " + T.cnt[1] + "    SWORDS: " + T.cnt[2] + "    CROWNS: " + T.cnt[3], "(set the dials to " + T.cnt.join(" ") + ", then OPEN)"]; return t; }
            if (T.panel === "ring") { t.lines = ["put the rings in this order:", T.ans.map(function(k) { return TRES_SYM_NAMES[k]; }).join(", ")]; return t; }
            if (T.panel === "towers") { t.lines = ["put this many coins in each spot:"]; t.grid = "towers"; return t; }
            if (T.panel === "beam") { t.lines = ["flip the mirrors marked with an X:"]; t.grid = "beam"; return t; }
            t.lines = [(T.box ? "[X] " : "[  ] ") + "dig in the " + ["TOP-LEFT", "RIGHT", "BOTTOM-RIGHT"][T.dPile] + " treasure pile (the X on the map) for the locked box",
                (T.boxOpen ? "[X] " : "[  ] ") + "box code (count them!): " + T.cnt.join(" ") + "  (cups, gems, swords, crowns)",
                (T.dust <= 0 ? "[X] " : "[  ] ") + "wiggle the duster over the altar until it's clean",
                (T.ring ? "[X] " : "[  ] ") + "ring lock: " + T.ans.map(function(k) { return TRES_SYM_NAMES[k]; }).join(", "),
                (T.towers ? "[X] " : "[  ] ") + "solve THE HOARD table (type cheater in it)",
                (T.hoard === 2 ? "[X] " : "[  ] ") + "drop the perfect hoard in the altar's bowl",
                (T.lit ? "[X] " : "[  ] ") + "solve the SUN WELL (type cheater in it)",
                (T.evo >= 1 ? "[X] " : "[  ] ") + "drop TRES on the altar.  then click him.",
                "then: drop him on the STAGE and pull the rope DOWN."];
            return t;
        }
        if (l9Scene === 4 || l9Scene === 5 || (l9Scene === 3 && (l9Rain.hole || l9Rain.fishOn)) || (l9Scene === 0 && l9Rain.door)) {
            var R = l9Rain;
            t.title = "THE RAIN ROUTE (level 9)";
            var lk = [];
            for (i = 0; i < 3; i++) { lk.push((R.combo[i] - R.lock[i] + 3) % 3); }
            t.lines = [(R.hole ? "[X] " : "[  ] ") + "cast ready, then yank the curtain rope UP",
                (R.ladder ? "[X] " : "[  ] ") + "hanger (from the costume rack) -> hook the ladder",
                (R.bulb ? "[X] " : "[  ] ") + "attic: spare bulb from the OLD LEVELS box -> the light",
                (R.lit ? "[X] " : "[  ] ") + "pull the light's chain",
                (R.gems >= 3 ? "[X] " : "[  ] ") + "3 rain gems: puddle (hanger), trunk, credits (the rain)",
                "    trunk locks: click them " + lk.join(", ") + " times (left to right)",
                (R.sky ? "[X] " : "[  ] ") + "pop the skylight with the hanger, slide the altar under",
                (R.storm ? "[X] " : "[  ] ") + "put the GUPPY in the full bowl -> the Storm Fish",
                (R.fishOn ? "[X] " : "[  ] ") + "drop the fish on the stage, pull the rope DOWN"];
            return t;
        }
        if (l9Scene === 3 && (l9Tres.back || l9Tres.onStage)) {
            t.title = "TRES";
            t.lines = l9Tres.onStage ? ["Tres is on the stage. pull the curtain rope DOWN!"] : ["click the open back curtain to go into the treasure room."];
            return t;
        }
        if (l9Scene === 2 && (l9Encore.clicks > 0 || l9Encore.stage > 0)) {
            t.title = "THE ENCORE (the way to LEVEL 10)";
            var bow = [];
            for (i = 0; i < L9_ENCORE_ORDER.length; i++) { bow.push(CHEAT_CAST[L9_ENCORE_ORDER[i]]); }
            t.lines = ["1) click \"(for real)\" 3 times.", "2) click them to bow in THIS order:", bow.slice(0, 5).join(", ") + ",", bow.slice(5).join(", "),
                "3) the hatch (bottom-left) code is 225.", "(25 cent budget x 9 cast members)"];
            return t;
        }
        cheatNormal(t);
        return t;
    }
    if (level === RAIN_LEVEL && rainEnd.phase === 8) { t.title = "THE RAIN AREA"; t.lines = ["click the rain door in the back of the stage!"]; return t; }
    if (level === RAIN_LEVEL && rainEnd.phase === 9) {
        if (rainZone.made !== rainZone.room) { raSetup(rainZone.room); }
        var Z = rainZone;
        t.title = "THE RAIN AREA  " + (Z.room + 1) + " / 9";
        if (Z.solved) { t.lines = ["solved! click the  >  on the right."]; return t; }
        if (Z.room === 0) {
            var hp = cheatHopPath();
            if (hp.length === 0) { t.lines = ["you're stuck! click START OVER, then type cheater again."]; }
            else { t.lines = ["hop to the puddles in this order (1, 2, 3...):"]; t.grid = "hop"; }
        } else if (Z.room === 1) {
            var sp = cheatSortPlan();
            if (sp === null) { t.lines = ["too tangled to figure out from here!", "click RESET, then type cheater again."]; }
            else {
                t.lines = ["pour tube -> tube (tubes are 1 to 6, left to right):"];
                for (i = 0; i < sp.length; i += 5) { t.lines.push(sp.slice(i, i + 5).join(",   ")); }
            }
        } else if (Z.room === 2) { t.lines = ["put umbrellas on the blue squares:"]; t.grid = "umb"; }
        else if (Z.room === 3) { t.lines = ["make the bridges look like this:"]; t.grid = "bridges"; }
        else if (Z.room === 4) { t.lines = ["the lightning clouds are the X's. open everything else!"]; t.grid = "sweep"; }
        else if (Z.room === 6) {
            var pn = raPegNext(Z.peg.p);
            if (!pn) { t.lines = ["no way to win from here. click START OVER, then type cheater again."]; }
            else { t.lines = ["NEXT: jump the glowing drop into the glowing empty puddle.", "(type cheater again after each jump)"]; t.grid = "peg"; t.peg = pn; }
        }
        else if (Z.room === 7) { t.lines = ["put lamps on the yellow squares:"]; t.grid = "lamp"; }
        else if (Z.room === 8) { t.lines = ["make these pairs:"]; t.grid = "dom"; }
        else {
            var fm = raFloodSolve(Z.fl.g);
            var cn = ["BLUE", "PURPLE", "TEAL", "WHITE", "PINK"];
            if (Z.fl.moves + fm.length > Z.fl.limit) { t.lines = ["too many moves used already. click RESET, then type cheater again."]; }
            else { t.lines = ["click these colors in order:"]; var cl = []; for (i = 0; i < fm.length; i++) { cl.push(cn[fm[i]]); } for (i = 0; i < cl.length; i += 6) { t.lines.push(cl.slice(i, i + 6).join(", ")); } }
        }
        return t;
    }
    if (level === RAIN_LEVEL) {
        t.title = "THE R.A.I.N. ENDING";
        if (rainEnd.phase === 3) { t.lines = ["click the STORM FISH to hurt him (5 each).", "move your mouse to DODGE his attacks.", "watch for warnings before each attack!"]; }
        else if (rainEnd.phase === 6 && rainEnd.puzzle) { t.lines = ["click each word until it says:", "Radiant. Amazing. Incredible. Nice.", "(the sticky notes are scrambled versions)"]; }
        else { t.lines = ["just watch! nothing to do right now."]; }
        return t;
    }
    if (level === TRES_LEVEL && tresEnd.phase === 6) { t.title = "TRES"; t.lines = ["click the GOLD DOOR in the back of the stage!"]; return t; }
    if (level === TRES_LEVEL && tresEnd.phase === 7) {
        if (goldArea.made !== goldArea.room) { gaSetup(goldArea.room); }
        var GZ = goldArea;
        t.title = "THE GOLD AREA  " + (GZ.room + 1) + " / 9";
        if (GZ.solved) { t.lines = ["solved! click the  >  on the right."]; return t; }
        if (GZ.room === 0) {
            var rn = cheatRushNext();
            if (!rn) { t.lines = ["hmm. click START OVER, then type cheater again."]; }
            else { t.lines = ["NEXT: slide the glowing bar " + (GZ.V[rn[0]][0] ? (rn[1] > 0 ? "RIGHT" : "LEFT") : (rn[1] > 0 ? "DOWN" : "UP")) + ".", "(" + rn[2] + " slides left. type cheater again after each one)"]; t.grid = "rush"; t.rush = rn; }
        } else if (GZ.room === 1) { t.lines = ["put this many coins in each pile:"]; t.grid = "magic"; }
        else if (GZ.room === 3) { t.lines = ["put the crowns here:"]; t.grid = "crowns"; }
        else if (GZ.room === 4) { t.lines = ["the code is:  " + GZ.code.join(" "), "(click the dials to set it, then OPEN)"]; }
        else if (GZ.room === 5) { t.lines = ["the treasure chests are here:"]; t.grid = "ships"; }
        else if (GZ.room === 6) { t.lines = ["one way to make 24:", GZ.sol24, "(do the parts in ( ) first. click START OVER if you need to.)"]; }
        else if (GZ.room === 7) {
            var mv2 = null;
            for (var mi = 0; mi < 22 && !mv2; mi++) {
                if (!GZ.mStart[mi]) { continue; }
                for (var mj = 0; mj < 22; mj++) {
                    if (GZ.mStart[mj] || mi === mj) { continue; }
                    var tst = GZ.mStart.slice(0); tst[mi] = 0; tst[mj] = 1;
                    if (gaMatchTrue(tst)) { mv2 = [mi, mj]; break; }
                }
            }
            t.lines = ["move the RED bar to the GREEN spot:"]; t.grid = "match"; t.match = mv2;
        }
        else if (GZ.room === 8) { t.lines = ["the path goes 1 -> 25 like this:"]; t.grid = "path"; }
        else {
            if (GZ.turn !== 0 || GZ.over) { t.lines = ["wait for your turn! (or click to start a new game)"]; }
            else {
                var nm = gaNimMove(GZ.nim);
                t.lines = ["take " + nm[1] + " coin" + (nm[1] > 1 ? "s" : "") + " from pile " + (nm[0] + 1) + "  (piles are 1 to 3, left to right)", "",
                    "the secret: make the piles 'cancel out'.", "(type cheater again on every turn)"];
            }
        }
        return t;
    }
    if (level === TRES_LEVEL) {
        t.title = "TRES";
        var P = tresEnd.phase;
        if (P === 3) { t.lines = ["click MEGA TRES to hurt him (5 each).", "move your mouse to DODGE. one attack at a time.", "(that bar might not be what you think it is...)"]; }
        else if (P === 5) {
            t.lines = ["hitting GIGA-TRES does nothing. use FOOL'S GOLD:", "1) wait for COIN SHOWER. some coins are dull + cracked.", "2) click one to pick it up.",
                "3) wait until he opens his mouth wide (AAAAH!)", "4) touch his mouth with it. -50 each!", "(shiny REAL gold heals him. don't!)"];
        } else { t.lines = ["just watch! nothing to do right now."]; }
        return t;
    }
    if (level === 10) {
        var P10 = l10.phase;
        if (P10 <= 0) {
            t.title = "BANANAS (" + (l10.cols ? l10.cols.length : 5) + ")";
            t.lines = ["open a wrong banana to get a clue. use the clues to", "narrow it down. too many wrong ones = new bananas.",
                "the key is in banana " + (l10.cols ? l10.key + 1 : "?") + ".", "then click the locked door."];
        } else if (P10 === 1) { t.title = "LEVEL 10"; t.lines = ["click to go on."]; }
        else if (P10 === 2) {
            t.title = "CHESS";
            var hm = (l10.turn === 1 && !l10.over) ? l10HelpMove() : null;
            l10.help = hm; l10.helpT = hm ? 600 : 0;
            if (!hm) { t.lines = ["wait for the AI to move, then type cheater again."]; }
            else {
                var mate = l10Mates(l10Apply(l10.board, hm[0], hm[1]));
                var kills = l10.board[hm[1]] !== 0;
                t.lines = ["DO THIS:", l10MoveWords(hm),
                    mate ? "that's CHECKMATE! you win!" : (kills ? "(it kills a piece = +1 point, but it's worth it)" : "(nothing dies, so no points)"),
                    "letters a-h are along the bottom, numbers 1-8 up the left side.",
                    "the 2 GREEN squares show it too. (close this, then do it)",
                    "type cheater again after the AI moves for the next one."];
            }
        } else if (P10 === 3) { t.title = "BREAKTIME!"; t.lines = ["click on the word TIME. a lot. (30 times)", "it will BREAK."]; }
        else if (P10 === 4) {
            t.title = "BACKWARDS TIME";
            t.lines = ["wait for time to FREEZE.", "then click the BLUEPRINTS on the little table (bottom left).", "use < > to pick A GIANT DOOR, then BUILD THIS!"];
        } else if (P10 === 5) {
            t.title = "THE SITE";
            if (!l10.lens) { t.lines = ["click the red LUNCHBOX on the table (right).", "there's a magnifying glass inside."]; }
            else if (!l10.siteKey) { t.lines = ["the tiny key is at about x " + round(l10.keyX) + ", y " + round(l10.keyY) + ".", "use the magnifying glass to see it, then click it."]; }
            else if (!l10.triedDoor && !l10.realKey) { t.lines = ["try the key on the giant door."]; }
            else if (!l10.realKey) { t.lines = ["the key says SHED. click the shed (left) to go in."]; }
            else { t.lines = ["click the giant door with the REAL key!"]; }
        } else if (P10 === 6) {
            t.title = "THE SHED";
            var good = [];
            for (var g10 = 0; g10 < l10.parts.length; g10++) { if (l10.parts[g10].ok) { good.push(L10_PARTS[l10.parts[g10].t] + " #" + ((g10 % 4) + 1)); } }
            t.lines = ["the WORKING ones are:", good.join(", "), "(counting from the left on each shelf)", "pick one up, then click GUS to give it to him.", "when the machine is done, click the key."];
        } else if (P10 === 8 && l10.dg) {
            var D10 = l10.dg;
            t.title = "THE DART BOOTH";
            if (D10.win) { t.lines = ["you did it! just watch."]; }
            else if (D10.view === 1 || !l10Plugged(1)) {
                t.lines = ["follow the cord from LASER at the top down to the power strip.", "it's plug #" + (D10.perm[0] + 1) + " (counting from the left). click it to unplug it.",
                    (!l10Plugged(1) ? "(the lights are off! click the glowing plug to plug them back in.)" : "(don't pull the LIGHTS plug...)")];
            } else {
                t.lines = [(D10.zero >= 1 ? "[X] " : "[  ] ") + "click the 0 on the SCOREBOARD to take it.",
                    (D10.zero === 2 ? "[X] " : "[  ] ") + "click the 0 in your POCKET, then click the target's track (not ON the target).",
                    (D10.jam ? "[X] " : "[  ] ") + "wait for the target to bump into the 0 and get stuck.",
                    (D10.paper ? "[X] " : "[  ] ") + "click your GUN, then the paper stuck in it.",
                    (!D10.off[0] ? "[  ] " : "[X] ") + "open the cabinet under the counter. unplug the LASER (plug #" + (D10.perm[0] + 1) + ").",
                    "[  ] shoot the stuck target!"];
            }
        } else { t.title = "THE DOOR"; t.lines = ["you did it. just watch."]; }
        return t;
    }
    cheatNormal(t);
    return t;
};
var drawCheatGrid = function(kind) {
    var i; var gx; var gy; var S;
    noStroke(); textAlign(CENTER);
    if (kind === "worms") {
        var plan = cheatWormPlan(); S = 30; gx = 200 - S * 2.5; gy = 214;
        for (i = 0; i < 25; i++) {
            var x = gx + (i % 5) * S; var y = gy + floor(i / 5) * S;
            fill(srWorms[i] ? 120 : 40, srWorms[i] ? 170 : 40, srWorms[i] ? 70 : 40); rect(x + 1, y + 1, S - 2, S - 2, 3);
            if (plan[i]) { fill(255, 80, 80); textSize(20); text("X", x + S / 2, y + S / 2 + 7); }
        }
    } else if (kind === "pipes") {
        S = 26; gx = 200 - S * 3; gy = 172;
        for (i = 0; i < SR_PN * SR_PN; i++) {
            var P = srPipes[i];
            var px = gx + (i % SR_PN) * S; var py = gy + floor(i / SR_PN) * S;
            fill(P.fixed ? 90 : 70, P.fixed ? 86 : 50, P.fixed ? 80 : 30); rect(px + 1, py + 1, S - 2, S - 2, 2);
            if (P.sol >= 0) {
                var m = P.m; var turns = 0;
                while (m !== P.sol && turns < 4) { m = srRot(m); turns++; }
                fill(100, 170, 255, 120); rect(px + 1, py + 1, S - 2, S - 2, 2);
                if (turns > 0 && turns < 4) { fill(255, 230, 120); textSize(15); text("" + turns, px + S / 2, py + S / 2 + 5); }
            }
        }
        fill(200, 220, 255); textSize(8); text("(blue = the water path)", 200, gy + SR_PN * S + 12);
    } else if (kind === "sudoku") {
        S = 34; gx = 200 - S * 2; gy = 214;
        for (i = 0; i < 16; i++) {
            var sx = gx + (i % 4) * S; var sy = gy + floor(i / 4) * S;
            fill(80, 60, 40); rect(sx + 1, sy + 1, S - 2, S - 2, 3);
            var c = SR_MC[srSud.sol[i] - 1];
            fill(c[0], c[1], c[2]); arc(sx + S / 2, sy + S / 2 + 2, 22, 18, 180, 360);
            fill(240, 230, 210); rect(sx + S / 2 - 3, sy + S / 2 + 2, 6, 8, 2);
        }
    } else if (kind === "snail") {
        for (i = 0; i < 4; i++) {
            var cc = SR_SC[srMind.code[i]];
            fill(cc[0], cc[1], cc[2]); ellipse(140 + i * 40, 240, 30, 30);
            fill(255); textSize(9); text(CHEAT_SNAIL[srMind.code[i]], 140 + i * 40, 268);
        }
    } else if (kind === "pic") {
        S = 22; gx = 200 - S * 3; gy = 204;
        for (i = 0; i < 36; i++) {
            var r = floor(i / 6); var cl = i % 6;
            fill(l9PicCell(l9Vault.pic, r, cl) ? 40 : 230, l9PicCell(l9Vault.pic, r, cl) ? 30 : 220, l9PicCell(l9Vault.pic, r, cl) ? 30 : 200);
            rect(gx + cl * S + 1, gy + r * S + 1, S - 2, S - 2, 2);
        }
    } else if (kind === "towers") {
        S = 30; gx = 200 - S * 2.5; gy = 196;
        for (i = 0; i < 25; i++) {
            fill(120, 84, 34); rect(gx + (i % 5) * S + 1, gy + floor(i / 5) * S + 1, S - 2, S - 2, 3);
            fill(255, 220, 110); textSize(16); text("" + l9Tres.tSol[i], gx + (i % 5) * S + S / 2, gy + floor(i / 5) * S + S / 2 + 6);
        }
    } else if (kind === "hop") {
        var hp2 = cheatHopPath(); S = 30; gx = 200 - S * 2.5; gy = 190;
        for (i = 0; i < 25; i++) {
            var hx = gx + (i % 5) * S; var hy = gy + floor(i / 5) * S;
            fill(i === rainZone.at ? 200 : 50, i === rainZone.at ? 220 : 90, i === rainZone.at ? 255 : 160); rect(hx + 1, hy + 1, S - 2, S - 2, 4);
            var st = hp2.indexOf(i);
            if (st >= 0) { fill(255, 240, 120); textSize(15); text("" + (st + 1), hx + S / 2, hy + S / 2 + 5); }
        }
        fill(200, 220, 255); textSize(8); text("(the light square is you)", 200, gy + 5 * S + 12);
    } else if (kind === "umb") {
        S = 26; gx = 200 - S * 3; gy = 190;
        for (i = 0; i < 36; i++) {
            var ux = gx + (i % 6) * S; var uy = gy + floor(i / 6) * S;
            if (rainZone.people.indexOf(i) >= 0) { fill(220, 80, 80); } else if (rainZone.umbSol[i]) { fill(80, 130, 255); } else { fill(40, 70, 50); }
            rect(ux + 1, uy + 1, S - 2, S - 2, 3);
        }
        fill(200, 220, 255); textSize(8); text("(red = people, blue = umbrellas)", 200, gy + 6 * S + 12);
    } else if (kind === "magic") {
        S = 40; gx = 200 - S * 1.5; gy = 196;
        for (i = 0; i < 9; i++) {
            fill(110, 78, 26); rect(gx + (i % 3) * S + 1, gy + floor(i / 3) * S + 1, S - 2, S - 2, 4);
            fill(255, 220, 110); textSize(20); text("" + goldArea.magSol[i], gx + (i % 3) * S + S / 2, gy + floor(i / 3) * S + S / 2 + 7);
        }
    } else if (kind === "rush") {
        var t2 = cheatHelp(); S = 24; gx = 200 - S * 3; gy = 170;
        var cells = gaRushCells(goldArea.V, goldArea.P);
        for (i = 0; i < 36; i++) {
            var v = cells[i];
            if (v < 0) { fill(48, 32, 12); } else if (t2.rush && v === t2.rush[0]) { fill(120, 255, 140); } else if (v === 0) { fill(150, 100, 50); } else { fill(220, 170, 50); }
            rect(gx + (i % 6) * S + 1, gy + floor(i / 6) * S + 1, S - 2, S - 2, 2);
        }
        fill(255, 230, 120); rect(gx + 6 * S + 2, gy + 2 * S + 4, 6, S - 8);
        fill(230, 200, 140); textSize(8); text("(green = slide this one.  brown = the cart)", 200, gy + 6 * S + 12);
    } else if (kind === "bridges") {
        var B = rainZone.br; S = 26; gx = 200 - S * 3.5; gy = 170;
        fill(30, 40, 70); rect(gx, gy, S * 7, S * 7, 4);
        for (i = 0; i < B.sol.length; i++) {
            if (!B.sol[i]) { continue; }
            var a = B.edges[i * 2]; var b2 = B.edges[i * 2 + 1];
            stroke(255, 230, 80); strokeWeight(B.sol[i] === 2 ? 5 : 2);
            line(gx + B.isl[a * 2 + 1] * S + S / 2, gy + B.isl[a * 2] * S + S / 2, gx + B.isl[b2 * 2 + 1] * S + S / 2, gy + B.isl[b2 * 2] * S + S / 2);
            noStroke();
        }
        for (i = 0; i < B.num.length; i++) {
            fill(230, 240, 255); ellipse(gx + B.isl[i * 2 + 1] * S + S / 2, gy + B.isl[i * 2] * S + S / 2, 18, 18);
            fill(40, 60, 100); textSize(10); text("" + B.num[i], gx + B.isl[i * 2 + 1] * S + S / 2, gy + B.isl[i * 2] * S + S / 2 + 4);
        }
        fill(200, 220, 255); textSize(8); text("(thick line = 2 bridges)", 200, gy + 7 * S + 12);
    } else if (kind === "sweep") {
        S = 24; gx = 200 - S * 4; gy = 170;
        for (i = 0; i < 64; i++) {
            fill(rainZone.sw.mine[i] ? 120 : 50, rainZone.sw.mine[i] ? 100 : 70, rainZone.sw.mine[i] ? 40 : 110); rect(gx + (i % 8) * S + 1, gy + floor(i / 8) * S + 1, S - 2, S - 2, 2);
            if (rainZone.sw.mine[i]) { fill(255, 230, 80); textSize(14); text("X", gx + (i % 8) * S + S / 2, gy + floor(i / 8) * S + S / 2 + 5); }
        }
    } else if (kind === "crowns") {
        S = 30; gx = 200 - S * 3; gy = 180;
        for (i = 0; i < 36; i++) {
            var jc = GA_JC[goldArea.reg[i]];
            fill(jc[0], jc[1], jc[2]); rect(gx + (i % 6) * S, gy + floor(i / 6) * S, S, S);
            if (goldArea.crSol[floor(i / 6)] === i % 6) { fill(60, 30, 0); textSize(16); text("W", gx + (i % 6) * S + S / 2, gy + floor(i / 6) * S + S / 2 + 6); }
        }
        fill(230, 200, 140); textSize(8); text("(W = crown)", 200, gy + 6 * S + 12);
    } else if (kind === "ships") {
        S = 28; gx = 200 - S * 3; gy = 176;
        for (i = 0; i < 36; i++) {
            fill(goldArea.shSol[i] ? 140 : 214, goldArea.shSol[i] ? 90 : 190, goldArea.shSol[i] ? 40 : 130); rect(gx + (i % 6) * S + 1, gy + floor(i / 6) * S + 1, S - 2, S - 2, 3);
        }
        fill(230, 200, 140); textSize(8); text("(brown = treasure chest)", 200, gy + 6 * S + 12);
    } else if (kind === "maze") {
        var mp = srMazePath(); S = 22; gx = 200 - S * 3.5; gy = 170;
        for (i = 0; i < 49; i++) {
            var on = mp.indexOf(i) >= 0 || i === srMaze.at;
            fill(on ? 255 : 40, on ? 220 : 36, on ? 90 : 50); rect(gx + (i % 7) * S + 1, gy + floor(i / 7) * S + 1, S - 2, S - 2, 2);
        }
        fill(120, 200, 255); ellipse(gx + (srMaze.at % 7) * S + S / 2, gy + floor(srMaze.at / 7) * S + S / 2, 10, 10);
    } else if (kind === "ky") {
        S = 26; gx = 200 - S * 3; gy = 170;
        for (i = 0; i < 36; i++) {
            fill(230, 215, 180); rect(gx + (i % 6) * S + 1, gy + floor(i / 6) * S + 1, S - 2, S - 2, 2);
            fill(120, 40, 40); textSize(15); text(l9Vault.kySol[i] === 0 ? "K" : "Y", gx + (i % 6) * S + S / 2, gy + floor(i / 6) * S + S / 2 + 5);
        }
    } else if (kind === "abc") {
        S = 28; gx = 200 - S * 2.5; gy = 176;
        for (i = 0; i < 25; i++) {
            fill(230, 215, 180); rect(gx + (i % 5) * S + 1, gy + floor(i / 5) * S + 1, S - 2, S - 2, 2);
            fill(120, 40, 40); textSize(16); text(VT_LET.charAt(l9Vault.abSol[i] - 1), gx + (i % 5) * S + S / 2, gy + floor(i / 5) * S + S / 2 + 6);
        }
    } else if (kind === "peg") {
        var tp = cheatHelp();
        for (i = 0; i < 15; i++) {
            var pxy = raPegXY(i); var px2 = 200 + (pxy[0] - 200) * 0.6; var py2 = 180 + (pxy[1] - 110) * 0.6;
            var hl = tp.peg && (i === tp.peg[0] || i === tp.peg[2]);
            fill(hl ? 120 : 40, hl ? 255 : 70, hl ? 140 : 120); ellipse(px2, py2, 22, 22);
            if (rainZone.peg.p[i]) { fill(150, 200, 255); ellipse(px2, py2, 12, 12); }
        }
    } else if (kind === "lamp") {
        S = 24; gx = 200 - S * 3.5; gy = 170;
        for (i = 0; i < 49; i++) {
            var L2 = rainZone.lamp;
            if (L2.blk[i]) { fill(60, 66, 90); } else if (L2.sol[i]) { fill(255, 230, 80); } else { fill(30, 44, 70); }
            rect(gx + (i % 7) * S + 1, gy + floor(i / 7) * S + 1, S - 2, S - 2, 2);
            if (L2.blk[i] && L2.num[i] >= 0) { fill(255); textSize(11); text("" + L2.num[i], gx + (i % 7) * S + S / 2, gy + floor(i / 7) * S + S / 2 + 4); }
        }
    } else if (kind === "dom") {
        var DD = rainZone.dom; S = 36; gx = 200 - S * 2.5; gy = 170;
        for (i = 0; i < 20; i++) { fill(40, 60, 100); rect(gx + (i % 5) * S + 2, gy + floor(i / 5) * S + 2, S - 4, S - 4, 4); fill(220, 235, 255); textSize(14); text("" + DD.g[i], gx + (i % 5) * S + S / 2, gy + floor(i / 5) * S + S / 2 + 5); }
        for (i = 0; i < DD.sol.length; i += 2) {
            var d1 = min(DD.sol[i], DD.sol[i + 1]); var d2 = max(DD.sol[i], DD.sol[i + 1]);
            var dw2 = d2 - d1 === 1 ? 2 * S : S; var dh2 = d2 - d1 === 1 ? S : 2 * S;
            noFill(); stroke(255, 220, 90); strokeWeight(3); rect(gx + (d1 % 5) * S + 4, gy + floor(d1 / 5) * S + 4, dw2 - 8, dh2 - 8, 8); noStroke();
        }
    } else if (kind === "match") {
        var tm = cheatHelp();
        pushMatrix(); translate(40, 120); scale(0.8);
        for (i = 0; i < 22; i++) {
            var LB = gaBar(i);
            var isFrom = tm.match && i === tm.match[0]; var isTo = tm.match && i === tm.match[1];
            if (goldArea.mStart[i] || isTo) {
                stroke(isFrom ? 255 : (isTo ? 100 : 230), isFrom ? 70 : (isTo ? 255 : 190), isFrom ? 70 : (isTo ? 120 : 60)); strokeWeight(6); line(LB[0], LB[1], LB[2], LB[3]); noStroke();
            }
        }
        stroke(230, 190, 60); strokeWeight(6); line(120, 180, 160, 180); line(250, 172, 290, 172); line(250, 192, 290, 192); noStroke();
        popMatrix();
    } else if (kind === "path") {
        S = 30; gx = 200 - S * 2.5; gy = 176;
        for (i = 0; i < 25; i++) {
            fill(110, 78, 26); rect(gx + (i % 5) * S + 1, gy + floor(i / 5) * S + 1, S - 2, S - 2, 3);
            fill(255, 230, 140); textSize(13); text("" + (goldArea.pSol.indexOf(i) + 1), gx + (i % 5) * S + S / 2, gy + floor(i / 5) * S + S / 2 + 5);
        }
    } else if (kind === "beam") {
        S = 26; gx = 200 - S * TB_N / 2; gy = 196;
        for (i = 0; i < TB_N * TB_N; i++) {
            var C = l9Tres.bm.cells[i];
            var bx = gx + (i % TB_N) * S; var by = gy + floor(i / TB_N) * S;
            fill(70, 50, 22); rect(bx + 1, by + 1, S - 2, S - 2, 2);
            if (C.k === 1) {
                stroke(200, 220, 240); strokeWeight(1.5);
                if (C.o === 0) { line(bx + 6, by + S - 6, bx + S - 6, by + 6); } else { line(bx + 6, by + 6, bx + S - 6, by + S - 6); }
                noStroke();
                if (C.sol !== undefined && C.sol !== C.o) { fill(255, 80, 80); textSize(17); text("X", bx + S / 2, by + S / 2 + 6); }
            } else if (C.k === 3) { tresGem(bx + S / 2, by + S / 2, 12, 230, 40, 70); }
            else if (C.k === 2) { fill(110, 105, 100); ellipse(bx + S / 2, by + S / 2, S - 12, S - 14); }
        }
    }
};
var drawCheat = function() {
    if (!cheatOn) { return; }
    var t = cheatHelp();
    noStroke();
    fill(0, 0, 0, 200); rect(0, 0, 400, 400);
    fill(40, 20, 50); rect(16, 16, 368, 368, 10);
    fill(70, 30, 90); rect(16, 16, 368, 40, 10);
    textAlign(CENTER);
    fill(255, 90, 120); textSize(20); text("CHEATER!", 200, 42);
    fill(255, 220, 120); textSize(12); text(t.title, 200, 76);
    fill(240, 235, 255); textSize(11);
    // wrap long lines so they fit in the box
    var out = [];
    for (var i = 0; i < t.lines.length; i++) {
        var words = t.lines[i].split(" "); var cur = "";
        for (var w = 0; w < words.length; w++) {
            var tryIt = cur === "" ? words[w] : cur + " " + words[w];
            if (textWidth(tryIt) > 340 && cur !== "") { out.push(cur); cur = "    " + words[w]; } else { cur = tryIt; }
        }
        out.push(cur);
    }
    var gap = out.length > 12 ? 14 : 17;
    for (var j = 0; j < out.length; j++) { text(out[j], 200, 100 + j * gap); }
    if (t.grid !== "") { drawCheatGrid(t.grid); }
    fill(200, 180, 220, 150 + sin(frameCount * 6) * 80); textSize(9); text("(click anywhere to close)", 200, 372);
};
var drawReal = function() {
    // start every frame with the same font, size + alignment (so nothing leaks from the last screen)
    textSize(12); textAlign(LEFT);
    // the "cheater" help screen pauses the game
    if (cheatOn) { drawCheat(); return; }
    var sx = 0; var sy = 0;
    if (shakeAmt > 0.3) {
        sx = random(-shakeAmt, shakeAmt);
        sy = random(-shakeAmt, shakeAmt);
        shakeAmt *= 0.88;
    } else {
        shakeAmt = 0;
    }
    pushMatrix();
    translate(sx, sy);
    drawScene();
    updateFx();
    if (showHint && stuckTimer > HINT_DELAY && draggingBtn === -1) {
        var targets = getHintTargets();
        for (var i = 0; i < targets.length; i++) {
            var tg = targets[i];
            if (tg.length >= 4) { drawDragHint(tg[0], tg[1], tg[2], tg[3], i * 29); }
            else { drawGlint(tg[0], tg[1], i * 37); }
        }
    }
    popMatrix();
    checkEvents();
    noStroke();
    if (flashAmt > 1) {
        fill(flashR, flashG, flashB, flashAmt);
        rect(0, 0, 400, 400);
        flashAmt *= 0.9;
    }
    if (fadeAmt > 1) {
        fill(0, 0, 0, fadeAmt);
        rect(0, 0, 400, 400);
        fadeAmt -= 8;
    }
};

// ============ SAFETY NET: if something breaks, the game keeps going and tells you where ============
var crashNote = {msg: "", where: "", t: 0};
var gameCrashed = function(err) {
    var fn = "";
    if (err && err.stack) { var ln = String(err.stack).split("\n"); if (ln.length > 1) { fn = ln[1].replace("at ", "").split("(")[0]; } }
    crashNote = {msg: err && err.message ? err.message : String(err), t: 400,
        where: "level " + level + "  scene " + l9Scene + "  room " + srRoom + "  rain " + rainEnd.phase + "  tres " + tresEnd.phase + "  " + fn};
};
var drawCrashNote = function() {
    if (crashNote.t <= 0) { return; }
    crashNote.t--;
    noStroke(); fill(120, 0, 0, 220); rect(6, 330, 388, 64, 6);
    fill(255); textSize(10); textAlign(LEFT);
    text("oops! something broke (the game kept going):", 14, 346);
    fill(255, 220, 220); text(crashNote.msg, 14, 362);
    fill(255, 255, 160); text(crashNote.where, 14, 378);
    fill(255, 200, 200); textSize(8); text("(tell Claude what this box says!)", 14, 390);
};
draw = function() {
    try { drawReal(); } catch (err) { gameCrashed(err); resetMatrix(); }
    drawCrashNote();
};
mousePressed = function() { try { mousePressedReal(); } catch (err) { gameCrashed(err); } };
mouseDragged = function() { try { mouseDraggedReal(); } catch (err) { gameCrashed(err); } };
mouseReleased = function() { try { mouseReleasedReal(); } catch (err) { gameCrashed(err); } };

// ============ SHORTCUT: press 1 to make level jump up by 1 ============
keyPressed = function() {
    // ============ type "cheater" to see what to do (only for the secret stuff) ============
    cheatBuf = (cheatBuf + key.toString().toLowerCase()).slice(-7);
    if (cheatBuf === "cheater") { cheatOn = 1; cheatBuf = ""; return; }
    if (key.toString() === "1") {
        draggingBtn = -1;
        level += 1;
    }
    // ============ SHORTCUT: press K to get the rain key ============
    if (key.toString() === "k" || key.toString() === "K") {
        srHasRainKey = 1;
        if (srDrop.state === 2) { srDrop.state = 3; }
        flash(140, 200, 255, 100);
    }
};
}//GAME!