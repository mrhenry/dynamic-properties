const EMITTER = Symbol('EMITTER');

export default class DynamicProperties {

	constructor(properties = {}, settings = { throttle: 64 }) {
		let cached = {};

		this[EMITTER] = document.createDocumentFragment();

		const addProperty = (key, getter, element = null) => {
			if (typeof this[key] !== 'undefined') {
				console.warn(key, 'is already defined in this property list');
				return false;
			}

			Object.defineProperty(this, key, {
				enumerable: true,
				configurable: true,
				get: () => {
					if (typeof cached[key] === 'undefined') {
						if (element) {
							cached[key] = getter.call(element);
						} else {
							cached[key] = getter();
						}
					}

					return cached[key];
				}
			});

			return this;
		};

		for (let key in properties) {
			const getter = properties[key];

			if (typeof getter === 'function') {
				addProperty(key, getter);
			} else if (typeof getter !== 'string' && getter.length) {
				// Lazy array check
				addProperty(key, getter[0], getter[1] || window);
			}
		}

		// Reset cache on resize
		let resizeTimeout;
		window.addEventListener('resize', e => {
			if (resizeTimeout) {
				clearTimeout(resizeTimeout);
			}

			resizeTimeout = setTimeout(() => {
				cached = {};
				resizeTimeout = undefined;

				const change = new Event('change');
				this.dispatchEvent(change);
			}, settings.throttle);
		});
	}

	addEventListener(...args) {
		this[EMITTER].addEventListener(...args);
	}

	removeEventListener(...args) {
		this[EMITTER].removeEventListener(...args);
	}

	dispatchEvent(...args) {
		this[EMITTER].dispatchEvent(...args);
	}

}
