import { EraserIcon, PenToolIcon, TypeIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Tool = {
  PEN: "pen",
  ERASER: "eraser",
  TEXT: "text",
};

function Board() {
  const [drawingMode, setDrawingMode] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState<string>("#000000");
  const [size, setSize] = useState<number>(2);
  const [text, setText] = useState<string>("");
  const [currentTool, setCurrentTool] = useState<string>(Tool.PEN);
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);

  function startDrawing(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!context) return;

    const {
      nativeEvent: { offsetX, offsetY },
    } = event;

    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setDrawingMode(true);
  }

  function draw(event: React.MouseEvent<HTMLCanvasElement>) {
    if (currentTool === Tool.TEXT) {
      return;
    }

    if (!drawingMode || !context) return;

    const { nativeEvent: { offsetX, offsetY } } = event;

    context.lineTo(offsetX, offsetY);
    context.lineCap = "round";
    context.lineWidth = size;
    context.strokeStyle = color;

    if (currentTool === Tool.PEN) {
      context.globalCompositeOperation = "source-over";
    } else {
      context.globalCompositeOperation = "destination-out";
    }

    context.stroke();
  }

  function endDrawing() {
    if (!context) return;

    context.closePath();
    setDrawingMode(false);

    if (!canvasRef.current) {
      return;
    }

    const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (imageData) setDrawingHistory((prev) => [...prev, imageData]);
  }

  function addTextToCanvas(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!context || !canvasRef.current || !text) return;

    if (currentTool === Tool.TEXT) {
      const { nativeEvent: { offsetX, offsetY } } = event;

      context.font = `${size}px Arial`;

      context.fillStyle = color;
      context.fillText(text, offsetX, offsetY);
      context.globalCompositeOperation = "source-over";
    }
  }

  const undoDrawing = () => {
    if (!context) return;

    if (drawingHistory.length > 0) {
      setDrawingHistory((prevHistory) => {
        const lastElem = prevHistory[prevHistory.length - 1];
        context.putImageData(lastElem, 0, 0);
        return prevHistory.slice(0, -1);
      });
    }
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx) {
      setContext(ctx);
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-2xl">
        <span className="bg-clip-text text-transparent font-extrabold bg-gradient-to-r from-orange-500 to-orange-300">
          WhiteBoard
        </span>
      </h1>
      <canvas
        height={window.innerHeight - 300} /* adjusted the height just for demo and better viewing purpose */
        width={window.innerWidth - 100} /* adjusted the width just for demo and better viewing purpose */
        ref={canvasRef}
        className="border border-slate-300 bg-white"
        onClick={(e) => addTextToCanvas(e)}
        onMouseDown={(e) => startDrawing(e)}
        onMouseMove={(e) => draw(e)}
        onMouseLeave={endDrawing}
        onMouseUp={endDrawing}
      />
      <label className="font-semibold">Choose Color:</label>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <label className="font-semibold">Tool width:</label>
      <input
        type="range"
        value={size}
        onChange={(e) => {
          e.persist();
          setSize(+e.target.value);
        }}
        min={1}
        max={25}
      />
      <label className="font-semibold">Choose Tool:</label>
      <div className="flex gap-3">
        <button
          title="Pen"
          onClick={() => setCurrentTool("pen")}
          className={`p-3 border border-slate-200 rounded-sm ${currentTool === "pen" && "bg-orange-400 text-white"}`}
        >
          <PenToolIcon />
        </button>
        <button
          title="Eraser"
          onClick={() => setCurrentTool("eraser")}
          className={`p-3 border border-slate-200 rounded-sm ${currentTool === "eraser" && "bg-orange-400 text-white"}`}
        >
          <EraserIcon />
        </button>
        <button
          title="Text"
          onClick={() => setCurrentTool("text")}
          className={`p-3 border border-slate-200 rounded-sm ${currentTool === "text" && "bg-orange-400 text-white"}`}
        >
          <TypeIcon />
        </button>
      </div>
      {currentTool === Tool.TEXT && (
        <input
          className="border border-slate-300 p-3 m-3"
          placeholder="Enter some text here"
          type="text"
          onChange={(e) => setText(e.target.value)}
        />
      )}
      <button
        onClick={undoDrawing}
        className="my-4 p-3 px-4 border rounded-full bg-black text-white"
      >
        UNDO
      </button>
    </div>
  );
}

export default Board;
