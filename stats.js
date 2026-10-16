/* Transparent, dependency-free statistics for the local researcher dashboard. */
window.StudyStats = (() => {
  const mean = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : NaN;
  const variance = a => a.length>1 ? a.reduce((s,x)=>s+(x-mean(a))**2,0)/(a.length-1) : NaN;
  const sd = a => Math.sqrt(variance(a));
  const erf = x => { const s=x<0?-1:1; x=Math.abs(x); const t=1/(1+0.3275911*x); return s*(1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x)); };
  const normalCDF = z => .5*(1+erf(z/Math.SQRT2));
  const tCDF = (t,df) => { // Numerical integration of Student-t density (Simpson's rule).
    const sign=t<0?-1:1, x=Math.abs(t), n=400, h=x/n;
    const f=u=>Math.exp(logGamma((df+1)/2)-logGamma(df/2)-.5*Math.log(df*Math.PI)-((df+1)/2)*Math.log1p(u*u/df));
    let sum=f(0)+f(x); for(let i=1;i<n;i++) sum+=(i%2?4:2)*f(i*h);
    return Math.min(1,Math.max(0,.5+sign*(h/3)*sum/2));
  };
  function logGamma(z){const c=[676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7]; if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);z-=1;let x=.99999999999980993;for(let i=0;i<c.length;i++)x+=c[i]/(z+i+1);const t=z+c.length-.5;return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);}
  function pairedT(a,b){const d=a.map((x,i)=>x-b[i]).filter(Number.isFinite), m=mean(d), s=sd(d), t=m/(s/Math.sqrt(d.length));return {n:d.length,meanDifference:m,t,df:d.length-1,p:2*(1-tCDF(Math.abs(t),d.length-1)),dz:m/s};}
  function rank(values){const sorted=values.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v), out=Array(values.length);for(let i=0;i<sorted.length;){let j=i+1;while(j<sorted.length&&sorted[j].v===sorted[i].v)j++;const r=(i+1+j)/2;for(let k=i;k<j;k++)out[sorted[k].i]=r;i=j;}return out;}
  function friedman(rows){const n=rows.length,k=rows[0]?.length||0;if(n<2||k<2)return null;const sums=Array(k).fill(0);rows.forEach(row=>rank(row).forEach((r,j)=>sums[j]+=r));const q=12/(n*k*(k+1))*sums.reduce((s,r)=>s+r*r,0)-3*n*(k+1);return {n,k,chiSquare:q,df:k-1,p:Math.exp(-q/2)};}
  function summarize(arr){const a=arr.filter(Number.isFinite);return {n:a.length,mean:mean(a),sd:sd(a),median:a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)]};}
  return {mean,sd,summarize,pairedT,friedman};
})();
