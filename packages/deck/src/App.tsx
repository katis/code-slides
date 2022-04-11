import { Navigate, Route, Routes } from 'solid-app-router'
import { Component, Suspense } from 'solid-js'
import { Center } from './components/layout/Center'
import { Slideshow } from './components/Slideshow/Slideshow'
import { SlideShowData } from './components/Slideshow/SlideShowData'

export const App: Component = () => (
  <Suspense fallback={<div class="text-neutral-100">Loading...</div>}>
    <Routes>
      <Route
        path="/slides/:deck/*slide"
        element={<Slideshow />}
        data={SlideShowData}
      />
    </Routes>
  </Suspense>
)
