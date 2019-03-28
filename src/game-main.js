import {startGame, vdp} from "../lib/vdp-lib";
import {clamp, getMapBlock, setMapBlock} from './utils';

function collidesAtPosition(left, top) {
	return getMapBlock('level1', Math.floor(left / 16), Math.floor(top / 16))
		=== 38;
}

function *main() {
	const mario = {
		left: 0,
		top: 0,
		width: 32,
		height: 32,
		get right() { return this.left + this.width; },
		get bottom() { return this.top + this.height; },
		horizontalVelocity: 0,
		verticalVelocity: 0,
		direction: 1
	};
	const camera = {
		left: 0,
		top: 0
	};

	const input = vdp.input;
	let counter = 0;
	vdp.configBackdropColor('#59f');

	while (true) {
		counter += 1;
		vdp.drawBackgroundTilemap('level1', { scrollX: camera.left });
		vdp.drawObject(vdp.sprite('mario').tile(Math.floor(counter / 8) % 3), mario.left - camera.left, mario.top, {
			width: mario.width,
			height: mario.height,
			flipH: mario.direction < 0
		});

		if (mario.left - camera.left > vdp.screenWidth / 2) {
			camera.left = mario.left - vdp.screenWidth / 2;
		}

		const paletteData = vdp.readPalette('level1');
		paletteData.array[7] = vdp.color.make('#f00');
		vdp.writePalette('level1', paletteData);

		mario.verticalVelocity += 0.2;

		mario.top += mario.verticalVelocity;
		mario.top = Math.floor(mario.top);
		while (collidesAtPosition(mario.left, mario.bottom) || collidesAtPosition(mario.right, mario.bottom)) {
			mario.verticalVelocity = 0;
			mario.top -= 1;
		}
		while (collidesAtPosition(mario.left, mario.top) || collidesAtPosition(mario.right, mario.top)) {
			mario.verticalVelocity = 0;
			mario.top += 1;
		}

		mario.left += mario.horizontalVelocity;
		mario.left = Math.floor(mario.left);
		while (collidesAtPosition(mario.left, mario.top) || collidesAtPosition(mario.left, mario.bottom)) {
			mario.horizontalVelocity = 0;
			mario.left += 1;
		}
		while (collidesAtPosition(mario.right, mario.top) || collidesAtPosition(mario.right, mario.bottom)) {
			mario.horizontalVelocity = 0;
			mario.left -= 1;
		}

		if (input.hasToggledDown(input.Key.Up)) {
			mario.verticalVelocity = -5;
		}

		if (input.isDown(input.Key.Left)) {
			mario.horizontalVelocity = -1;
			mario.direction = -1;
		}
		else if (input.isDown(input.Key.Right)) {
			mario.horizontalVelocity = +1;
			mario.direction = +1;
		}
		else {
			mario.horizontalVelocity = 0;
		}


		yield;
	}
}

startGame('#glCanvas', vdp => main(vdp));
