import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { MainMap } from "../scenes/MainMap";
import { StoreScene } from "../scenes/StoreScene";

const EcommerceGame = () => {
    const gameContainer = useRef(null);


    useEffect(() => {
        if (!gameContainer.current) {
            const gameConfig = {
                type: Phaser.CANVAS,
                width: 1920,
                height: 1080,
                parent: "game-container",
                physics: { default: "arcade", arcade: { gravity: { y: 0 }, debug: false } },
                scene: [MainMap, StoreScene],

            };
            gameContainer.current = new Phaser.Game(gameConfig);
        }


        return () => {
            if (gameContainer.current) {
                gameContainer.current.destroy(true);
                gameContainer.current = null;
            }
        }
    }, []);

    return (
        <>
            <div id="game-container"></div>
        </>
    )
}

export default EcommerceGame;