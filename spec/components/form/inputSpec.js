import {window} from "./../../utils.js";
import {input} from "./../../../src/components/form/input.js";
import _ from 'mithril';
import chai from "chai";
import classnames from "classnames";
import {getVdom} from "./../../utils.js";
import {icon} from "./../../../src/components/icon/icon.js";
import {label} from "./../../../src/components/label.js";
import {button} from "./../../../src/components/button/button.js";
import {expect} from "chai";


describe("input", () => {
	describe(".view", () => {
		let attrs, vdom;

		beforeEach(() => {
			attrs = {
				prepend: icon,
				append: icon,
				onclick: "aCallabck",
				type: "hidden",
				name: "aName"
			};

			_.render(document.body, _(input, attrs));
		});

		it("includes 'name'", () => {
			let inputDom = document.querySelector("input");
			expect(inputDom.name).to.equal(attrs.name);
		});

		it("'s root dom is a div", () => {
			expect(vdom.tag).to.equal("div");
		});

		it("it appends", function () {
			expect(vdom.children[2]).to.exist;
		});

		it("it prepends", function () {
			expect(vdom.children[0]).to.exist;
		});

		it("'s root element has 'ui' and 'input' in its class", () => {
			expect(vdom.attrs.class).to.have.string("ui");
			expect(vdom.attrs.class).to.have.string("input");
		});

		it("changes class of 'input' element to 'hidden' if 'attrs.type' is 'hidden'", () => {
			expect(vdom.children[1]);
		});
	});

  describe(".getClassList",  () => {
		let vnode;

		beforeEach(() => {
			vnode = {
				attrs: {},
				children: [],
				state: {}
			};
		});

    it("returns '.ui.input' if there is nothing to prepend or append", () => {
			let classList = input.getClassList(vnode);
      expect(classList).to.contain("ui");
      expect(classList).to.contain("input");
    });

    it("includes 'right icon' if an icon is being appended", () => {
      vnode.attrs = {append: icon};
			let classList = input.getClassList(vnode);
      expect(classList).to.contain("right icon");
    });

    it("includes 'left icon' if an icon is being prepended", () => {
      vnode.attrs = {prepend: icon};
			let classList = input.getClassList(vnode);
      expect(classList).to.contain("left icon");
    });

    it("returns 'left right icon' if input is surrounded by icons", () => {
      vnode.attrs = {prepend: icon, append: icon};
			let classList = input.getClassList(vnode);
      expect(classList).to.contain("left right icon");
    });

    it("returns 'left labeled' if a label is being prepended", () => {
      vnode.attrs = {prepend: label};
			let classList = input.getClassList(vnode);
      expect(classList).to.contain("left labeled");
    });

    it("returns 'right labeled' if a label is being appended", () => {
      vnode.attrs = {append: label};
			let classList = input.getClassList(vnode);
      expect(classList).to.contain("right labeled");
    });

    it("returns 'left right labeled'", () => {
      vnode.attrs = {prepend: label, append: label};
			let classList = input.getClassList(vnode);
      expect(classList).to.contain("left right labeled");
    });

    it("returns 'left action'", () => {
      vnode.attrs = {prepend: button};
			let classList = input.getClassList(vnode);
      expect(classList).to.contain("left action");
    });

    it("returns 'right labeled'", () => {
      vnode.attrs = {append: button};
			let classList = input.getClassList(vnode);
      expect(classList).to.contain("right action");
    });

    it("returns 'left right action'", () => {
      vnode.attrs = {prepend: button, append: button};
			let classList = input.getClassList(vnode);
      expect(classList).to.contain("left right action");
    });

		it("includes 'fluid'", () => {
      vnode.attrs = {fluid: true};
			let classList = input.getClassList(vnode);
			expect(classList).to.contain("fluid");
		});
  });
});
