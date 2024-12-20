import React, { Component } from 'react'
import Carousel from "./Carousel"
import {InfoBlock} from "./InfoBlock"

export const MainRoomsBanner = () => {
	return (
		<header className="cite-top container">
			<Carousel />
			<div className="aside">
				<InfoBlock />
			</div>
		</header>
	)
}
