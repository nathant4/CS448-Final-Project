import './App.css';
import React, { useState, useEffect} from 'react';
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import data from "./smogon.json";
import styled from "styled-components";
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';


const Wrapper = styled.div`
  height: 500px;
  width: 1500px;
`;
const SliderWrapper = styled.div`
  width: 200px;
`;
const FlexWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;


let tierToIndex = { "Uber": 0, "OU": 1, "UU": 2, "RU": 3, "NU": 4, "PU": 5 };

let nivo = ["#e8c2a0FF", "#f47660FF", "#f1e25bFF", "#e8a838FF", "#61cdbbFF", "#97e3d5FF"];

let types = [];
data.forEach(object => {
  if (object["Type.1"] !== "" && !types.includes(object["Type.1"])) {
    types.push(object["Type.1"]);
  }
  if (object["Type.2"] !== "" && !types.includes(object["Type.2"])) {
    types.push(object["Type.2"]);
  }
});

function isBL(tier) {
  return (tier === "BL" || tier === "BL2" || tier === "BL3" || tier === "BL4" || tier === "AG");
}

let tiers = [];
data.forEach(object => {
  if (object["Tier"] !== "" && !tiers.includes(object["Tier"]) && !isBL(object["Tier"])) {
    tiers.push(object["Tier"]);
  }
});

let tierData = {};
data.forEach(poke => {
  let twoTypes = [];
  twoTypes.push(poke["Type.1"]);
  if (poke["Type.2"] !== "") twoTypes.push(poke["Type.2"]);
  if (!tierData[poke["Tier"]]) {
    tierData[poke["Tier"]] = {}
    tierData[poke["Tier"]]["total"] = 0;
    types.forEach(elem => {
      tierData[poke["Tier"]][elem] = 0
    });
  }
  twoTypes.forEach(type => {
    tierData[poke["Tier"]][type] += 1
    tierData[poke["Tier"]]["total"] += 1;
  });
});

delete tierData.AG
delete tierData.BL
delete tierData.BL2
delete tierData.BL3
delete tierData.BL4

let tiersArray = []
for (const tier in tierData) {
  tierData[tier]["tier"] = tier;
  types.forEach(type => {
    tierData[tier][type] = tierData[tier][type] / tierData[tier]["total"] * 100;
  });
  tiersArray.push(tierData[tier]);
}

let tierTotals = {}
tiers.forEach(tier => {
  if (!tierTotals[tier] && !isBL(tier)) {
    tierTotals[tier] = 0;
  }
});
data.forEach(poke => {
  if (poke["Tier"] !== "" && !isBL(poke["Tier"])) {
    tierTotals[poke["Tier"]] += 1
  }
});
console.log("tierTotals: ", tierTotals)


let typeData = {};
types.forEach(elem => {
  typeData[elem] = {}
  typeData[elem]["total"] = 0;
  tiers.forEach(tier => {
    typeData[elem][tier] = 0;
  });
});
data.forEach(poke => {
  if (!isBL(poke["Tier"])) {
    let twoTypes = [];
    twoTypes.push(poke["Type.1"]);
    if (poke["Type.2"] !== "") twoTypes.push(poke["Type.2"]);
    twoTypes.forEach(type => {
      typeData[type][poke["Tier"]] += 1
      typeData[type]["total"] += 1;
    });
  }
});

let typeArray = []
for (const type in typeData) {
  typeData[type]["type"] = type;
  typeData[type]["denominator"] = 0;
  tiers.forEach(tier => {
    let barHeight = typeData[type][tier] / tierTotals[tier] * 100;
    typeData[type][tier] = barHeight;
  });
  // tiers.forEach(tier => {
  //   typeData[type][tier] = normalize(typeData[type][tier], typeData[type]["max"], typeData[type]["min"])
  // });
  typeArray.push(typeData[type]);
}

console.log("typeArray: ", typeArray);

function normalize(val, max, min) {
  return (val - min) / (max - min);
}

let statsData = {};
tiers.forEach(tier => {
  let tierObj = {}
  tierObj["id"] = tier;
  tierObj["data"] = []
  statsData[tier] = tierObj;
});
data.forEach(poke => {
  if (!isBL(poke["Tier"])) {
    let point = {};
    point["x"] = poke["Tier"];
    point["y"] = poke["Total"];
    statsData[poke["Tier"]]["data"].push(point);
  }
});
let statsArray = [];
for (let x in statsData) {
  statsArray.push(statsData[x]);
}



let generations = [];
data.forEach(object => {
  if (object["Generation"] !== "" && !generations.includes(object["Generation"])) {
    generations.push(object["Generation"]);
  }
});
generations.sort();
let generationsArray = [{}, {}, {}, {}, {}, {}];
generations.forEach(gen => {
  generationsArray[gen-1]["generation"] = gen
  tiers.forEach(tier => {
    if (!isBL(tier)) {
      generationsArray[gen-1][tier] = 0
    }
  });

});
data.forEach(dude => {
  if (!isBL(dude["Tier"])) {
    generationsArray[dude["Generation"]-1][dude["Tier"]] += 1
  }
});
for (let gen = 0; gen < 6; gen++) {
  for (let tier in tierTotals) {
    generationsArray[gen][tier] = generationsArray[gen][tier] / tierTotals[tier] * 100;
  }
}

console.log("generationsArray: ", generationsArray);

console.log("generations: " , generations);


function App() {
  const [tierClicked, setTierClicked] = useState(undefined);
  const [tierColors, setTierColors] = useState(nivo);
  useEffect(() => {
    if(tierClicked) {
      let newColors = [];
      for (let i = 0; i < 6; i++) {
        if (tierToIndex[tierClicked] === i) {
          newColors.push(tierColors[i].substring(0,7) + "FF");
        } else {
          newColors.push(tierColors[i].substring(0,7) + "33");
        }
      }
      setTierColors(newColors);
    }
  }, [tierClicked]);

  function clickBarHandler(nodeData, e) {
    setTierClicked(nodeData.id);
  }

  const [range, setRange] = useState([0, 780]);

  const handleChange = (event, newRange) => {
    setRange(newRange);
  };

  const width = `
      .silder {
          width: 200;
      }
  `;

  return (
    <div className="App">
      <h1>What Makes a Pokemon Competetively Viable?</h1>
      <div>
        Since generation 1 came out in 1996 with the release of Pokemon Red and Pokemon Blue, the Dragon type
        pokemon has always been widely considered the best pokemon type due to their high base stat totals.
        However as newer pokemon generations arise, the pokemon company has learned to diversify its pokemon
        collection in order to keep the new games interesting. But how have the new generations affected the
        competetive landscape of pokemon? Do Dragons still reign supreme? Is there another pokemon type that
        is silently on top? Are high base stat totals really the most important factor?
      </div>

      <div>
        I first explored how a pokemon's type affects its competetive tier. I created a bar graph that displays
        the percentage of pokemon for each pokemon type in a given competetive tier out of the total number of pokemon
        in that tier. This allows us to visualize which types of pokemon are most prevalent in each of the tiers.
        Clicking on any of the bars will highlight all other bars of the same competetive tier. From this it is easy
        to see that Dragon pokemon are very prevalent in the highest competetive tiers, but Flying and Psychic pokemon
        are also prevalent.
      </div>
      <Wrapper>
        <ResponsiveBar
          data={typeArray}
          keys={tiers}
          indexBy="type"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.15}
          groupMode="grouped"
          valueScale={{ type: 'linear' }}
          colors={tierColors}
          borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Type',
              legendPosition: 'middle',
              legendOffset: 32
          }}
          axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Percentage',
              legendPosition: 'middle',
              legendOffset: -40
          }}
          label={d => d.value.toFixed(1)+"%"}
          labelSkipWidth={12}
          labelSkip={12}
          labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
          legends={[
            {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          onClick={clickBarHandler}
        />
      </Wrapper>
      <div>
        Next, I decided to determine exactly how important base stat totals are in determining a pokemons competetive tier.
        In recent generations it seemed that The Pokemon Company had been making some pokemon competetively viable
        with less than stellar base stats. This could be done through the pokemon's ability, moveset, or many other factors.
        To visualize this aspect of pokemon I plotted each pokemon's base state total over the pokemon's competetive tier.
        As expected the pokemon with the highest base stats are the most useful competetively. It is relatively
        linear that the pokemon witht the higher base stats will generally be expected to perform better competetively.
      </div>
      <Typography  gutterBottom>
        Slider for range of Y values
      </Typography>
        <FlexWrapper>
          <SliderWrapper>
            <Slider value={range} onChange={handleChange} aria-labelledby="continuous-slider" min={0} max={780}/>
          </SliderWrapper>
        </FlexWrapper>
      <Wrapper>
        <ResponsiveScatterPlot
            data={statsArray}
            margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
            xScale={{ type: 'point', min: 0, max: '7' }}
            yScale={{ type: 'linear', min: range[0], max: range[1] }}
            blendMode="multiply"
            axisTop={null}
            axisRight={null}
            axisBottom={{
                orient: 'bottom',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Tier',
                legendPosition: 'middle',
                legendOffset: 46
            }}
            axisLeft={{
                orient: 'left',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Base Stat Total',
                legendPosition: 'middle',
                legendOffset: -60
            }}
            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 130,
                    translateY: 0,
                    itemWidth: 100,
                    itemHeight: 12,
                    itemsSpacing: 5,
                    itemDirection: 'left-to-right',
                    symbolSize: 12,
                    symbolShape: 'circle',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemOpacity: 1
                            }
                        }
                    ]
                }
            ]}
        />
      </Wrapper>
      <div>
        Finally, I looked at how a pokemon's generation affected its competetive tier. In recent generations it seemed that
        the newest generations had the best pokemon. This also seemed intuitive as the game makers would want users to enjoy playing
        with the newer pokemon. I was surprised to find that the 3rd generation dominated the competetive scene with more than
        a third of the Uber pokemon and a substanital amount of OU tiered pokemon as well. Generation 1 and generation 4 also each
        had a substanital amount of higher tiered pokemon. This plot works similarly to the first one in that clicking on a bar
        will highlight all other bars of that same competetive tier.
      </div>
      <Wrapper>
        <ResponsiveBar
          data={generationsArray}
          keys={tiers}
          indexBy="generation"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.15}
          groupMode="grouped"
          valueScale={{ type: 'linear' }}
          colors={tierColors}
          borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Generation',
              legendPosition: 'middle',
              legendOffset: 32
          }}
          axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Percentage',
              legendPosition: 'middle',
              legendOffset: -40
          }}
          label={d => d.value.toFixed(1)+"%"}
          labelSkipWidth={12}
          labelSkip={12}
          labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
          legends={[
            {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          onClick={clickBarHandler}
        />
      </Wrapper>
      <div>
        After exploring these three aspects of competetive pokemon (type, base stats, and generation) it is easy
        to see what aspects of a pokemon could make it competetively viable. It is no surprise that Dragon Pokemon
        are close to the top of the food chain, however it actually seems that Psychic Pokemon are generally in the
        lead for most competetively viable as they have a higher percentage of Uber and OU Pokemon. Base stat
        totals DO have a high correlation with a pokemons competetive tier. Also surprsingly, the third generation of
        pokemon is dominant across all the other generations of pokemon. Bringing it all together, the pokemon in the
        upper tiers of competetive play are frequently Dragon, Flying, or Psychic type; have high base stat totals; and
        are from Genertion 3. 

      </div>
      </div>

  );
}

export default App;
