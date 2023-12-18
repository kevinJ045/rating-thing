import { Component } from "rayous";
import { buildProps } from "rayous/extra";
import "@/styles/main.scss";


export default class extends Component {
	build(props: buildProps){
		return props.page!
	}
}