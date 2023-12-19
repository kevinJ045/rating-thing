import { Component, Image, Text, Widget } from "rayous";
import { ArrayController, WidgetEvent, buildProps } from "rayous/extra";
import { React } from "rayous/react";


export default class extends Component {
	dragged: any = null;
	name: string = "default";
	
	items : ArrayController<{
		url: string,
		class: string,
		name: string
	}> = new ArrayController<{
		url: string,
		class: string,
		name: string
	}>([]);

	static updateMode: "reinit" | "refresh" = "refresh";


	initState(props: any): void {
		const name = (location.search.indexOf('q=') > -1 ? location.search.split('q=')[1] : 'list');
		this.name = name;
	}

	getStoreName(name: string){
		return name + '-' + this.name;
	}

	save() {
		window.localStorage.setItem(this.getStoreName('ratings'), JSON.stringify(this.items.get()));
	}

	retrieve(save = false) {
		const itemsString = window.localStorage.getItem(this.getStoreName('ratings'));
		const items = itemsString ? JSON.parse(itemsString) : [];
		if(save) this.items.set(items);;
		return items as [];
	}

	drag({ original }: { original: DragEvent}){
		this.dragged = Widget.from(original.target as HTMLElement);
		original.dataTransfer.setData('text/plain', (original.target as HTMLImageElement).src);
		original.dataTransfer.setData('text/plain-id', (original.target as HTMLImageElement).id);
		original.dataTransfer.setData('text/plain-name', (original.target as HTMLImageElement).getAttribute('title'));
	}

	rm(e: WidgetEvent){
		e.prevent();
		e.target.remove();
		
		let w: HTMLImageElement = e.target.raw().at(0) as any;

		const src = w.src;
		
		this.removeItem(src);
	}

	removeItem(src: string){
		this.items.splice(this.items.indexOf(this.items.find(i => i.url == src)), 1);
	}

	addChild(url: string, target: Element, name?: string){

		let widget = Widget.from(target as HTMLElement);
		const image = new Image(url, {
			class: 'rate-child',
			onDragstart: (e: any) => this.drag(e),
			onContextmenu: (e: any) => this.rm(e),
			onClick: () => {
				const newname = prompt('name');
				const item = this.items.find(item => item.url == url)!;
				if(newname == item.name) return;

				item.name = newname;
				this.items.set(this.items.get());
				image.attr({ title: newname });
			}
		});
		image.$id = 'elt-'+image.id;

		image.attr({ title: name });

		if(!widget.hasClass('rate-children')){
			widget = Widget.from(target.closest('.rate-class') as HTMLElement);
			if(widget.find('.rate-children')){
				widget = widget.find('.rate-children');
			} else {
				widget = (Widget.from(widget.raw().find('.rate-children').at(0)))
			}
		} else if(widget.hasClass('.rate-class')) {
			widget = widget
			.find('.rate-children') || (Widget.from(widget.raw().find('.rate-children').at(0)));
		} 
		
		widget.add(image);

		this.items.push({
			url,
			name: name || "",
			class: (widget.hasClass('rate-children') ? Widget.from(target.closest('.rate-class') as any) : widget).attr('data-rate-class') as string
		});
	}

	addFiles(files: (File | Blob)[], element: any){
		(files).forEach(file => {
			var reader = new FileReader();
			reader.readAsDataURL(file);

			reader.onload = () => {
				var content = reader.result;
				this.addChild(content.toString(), element as Element);
			}
		});
	}

	changeName(){
		const name = prompt('list name');
		if(name){
			location.search = '?q='+name;
		}
	}

	build(props: buildProps) {
		return new Widget({
			children: [
				new Text('List name: '+this.name, {
					class: 'title',
					onClick: () => this.changeName()
				}),
				<div class="rate-container">
					<div class="rate-class rate-class-S" data-rate-class="S">
						<div class="rate-class-type">
							S
						</div>
						<div class="rate-children"></div>
					</div>
					<div class="rate-class rate-class-A" data-rate-class="A">
						<div class="rate-class-type">
							A
						</div>
						<div class="rate-children"></div>
					</div>
					<div class="rate-class rate-class-B" data-rate-class="B">
						<div class="rate-class-type">
							B
						</div>
						<div class="rate-children"></div>
					</div>
					<div class="rate-class rate-class-C" data-rate-class="C">
						<div class="rate-class-type">
							C
						</div>
						<div class="rate-children"></div>
					</div>
					<div class="rate-class rate-class-D" data-rate-class="D">
						<div class="rate-class-type">
							D
						</div>
						<div class="rate-children"></div>
					</div>
					<div class="rate-class rate-class-E" data-rate-class="E">
						<div class="rate-class-type">
							E
						</div>
						<div class="rate-children"></div>
					</div>
					<div class="rate-class rate-class-F" data-rate-class="F">
						<div class="rate-class-type">
							F
						</div>
						<div class="rate-children"></div>
					</div>
				</div>
			]
		});
	}

	afterBuild({page}: {page: Widget}): void {
		
		(window).addEventListener('dragover', (e: DragEvent) => {
			e.stopPropagation();
			e.preventDefault();
		});

		(window).addEventListener('dragend', (e: DragEvent) => {
			e.stopPropagation();
			e.preventDefault();
		});

		(window).addEventListener('drop', (e: DragEvent) => {
			e.preventDefault();
			if(this.dragged) {
				
				if(!this.dragged) return;

				const image = e.dataTransfer.getData('text/plain');
				const imageid = e.dataTransfer.getData('text/plain-id');
				const imagename = e.dataTransfer.getData('text/plain-name');

				page.find('#'+imageid).remove();
				this.removeItem(image);
				this.addChild(image, e.target as HTMLElement, imagename);
				this.dragged = null;
			} else {
				var files = e.dataTransfer.files;

				if(files.length < 1) return;
				this.addFiles(Array.from(files), e.target);
			}
		});

		(window).addEventListener('paste', (e: ClipboardEvent) => {
			var item = Array.from(e.clipboardData.items).find(x => /^image\//.test(x.type));
		
			var blob = item.getAsFile();
	
			this.addFiles([blob], page.raw().at(0).querySelector('.rate-class-F'));
		});

		this.items.onChange(() => {
			this.save();
		});

		this.retrieve().forEach((item: any) => {
			this.addChild(item.url, page.raw().at(0).querySelector('.rate-class-'+item.class), item.name);
		});

		const self = this;
		page.raw().find('.rate-class-type').on('click', function(){
			const input = document.createElement('input');
			input.type = 'file';
			input.onchange = () => {
				const files = input.files;
				if(files.length < 1) return;
				self.addFiles(Array.from(files), this);
			}
			input.click();
		});

	}
}