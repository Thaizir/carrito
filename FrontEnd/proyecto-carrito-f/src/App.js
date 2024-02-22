import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { Navbar } from './components/Navbar';
import { Tienda } from './components/Tienda';
import { Home } from './components/Home';
import { Carrito } from './components/Carrito';


function App() {
  return (
    <div>


      <BrowserRouter>
        <div className='App'>
          <div className='content'>
            <Navbar />
            <Routes>
              <Route exact path='/' element={<Home />} />
              <Route path='/tienda' element={<Tienda />} />
              <Route path='carrito' element={<Carrito />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>

    </div>
  );
}

export default App;
