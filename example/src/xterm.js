// MIT License
//
// Copyright (c) 2021-2022 Nobuo Kato (katonobu4649@gmail.com)
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import React, {useRef, useEffect} from 'react'
import {XTerm} from 'xterm-for-react'

//const toBlack   = "\x1b[30m"
//const toRed     = "\x1b[31m"
const toGreen   = "\x1b[32m"
//const toYellow  = "\x1b[33m"
const toBlue    = "\x1b[34m"
//const toMagenta = "\x1b[35m"
//const toCyan    = "\x1b[36m"
//const toWhite   = "\x1b[37m"
//const toDefault = "\x1b[0m"

const textColor_serial = (str)=>toGreen+str+toBlue

const LoadedXterm  = function({message}){
    const xtermRef = useRef(null);
    const encoder = useRef(new TextEncoder());
    useEffect(()=>{
        console.log("Xterm:Mounted");
        return ()=>{
            console.log("Xterm:Unmounted");
        }
    },[]);
    useEffect(()=>{
        xtermRef.current.terminal.writeln(toBlue + "\"" + textColor_serial(message)+ "\"");
    },[message])

    return (
        <XTerm
            ref={xtermRef}
            options={{
                theme: {
                    background: '#fdf6e3',
                    blue: '#3498db',
                    red:  '#a40000',
                    green:'#19857b'
                }
            }}
            onData={
                (data) => {
                    // local echo
                    xtermRef.current.terminal.writeUtf8(encoder.current.encode(data));
                    console.log("from terminal:", data);
                }                    
            }
        />
    )
}

export default LoadedXterm;
