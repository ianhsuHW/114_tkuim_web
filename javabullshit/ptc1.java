package javabullshit;
public class ptc1{
    public static void main(String[] args) {
        String[] products = {"麵包", "牛奶", "巧克力", "泡麵"};
        int[] prices ={35,40,25,20};
        int minPrice =Integer.MAX_VALUE;
        int idx = -1;
        
        for(int i=0;i<prices.length;i++){
            if(minPrice>prices[i]){
               minPrice= prices[i];
               idx = i;
            }

       } 
       System.out.println(minPrice);
       System.out.println(products[idx] + ", " + prices[idx]);
    }
}