"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export default function Scene2() {

  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0,1], [120,-120])

  return (

    <section
      ref={ref}
      className="scene2-root"
      style={{fontFamily: "var(--font-crystal), sans-serif"}}
    >
      <div className="scene2-panel">

        <motion.div
          style={{ y }}
          className="scene2-inner"
        >

          <h1 className="scene2-title">
            CREATIVE <br/>
            DIGITAL <br/>
            EXPERIENCES
          </h1>

          <p className="scene2-text">
            Founded in 2012
            <br/><br/>
            We blend story, art & technology as an in-house team of passionate makers
            <br/><br/>
            Our industry-leading web toolset consistently delivers award-winning work through quality & performance
          </p>

        </motion.div>

      </div>

    </section>

  )

}