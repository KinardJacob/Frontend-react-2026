/*import "../css/Slideshow.css";
//import images here

const Slideshow = () => {
    const [slideIndex, setSlideIndex] = useState(0);

    const importAll = (r) => {
        return r.keys().map(r);
    }

    const images = importAll(
        require.context("../assets/slideshow", false, /\.(png|jpe?g|svg)$/)
    );

    const slideForward = () => {
        setSlideIndex(slideIndex + 1);
    };
};*/