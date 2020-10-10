#include <fstream>
const int width=255, height=255;

int main (){
    std::ofstream img("vaa.ppm");
    img<<"P3"<<std::endl;
    img<<width<<" "<<height<<std::endl;
    img<<"255"<<std::endl;

    for (size_t i = 0; i < width; i++)
    {
        for (size_t j = 0; j < height; j++)
        {
            int r= i%255, g=j%255,b=0;
            img<<r<<" "<<g<<" "<<b<<std::endl;
        }
        
    }
    return 0;
}